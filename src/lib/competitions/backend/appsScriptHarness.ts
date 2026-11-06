// Runs google-apps-script/competition-platform.js on Node with an in-memory imitation of the
// Google services it uses (Sheets, Drive, Cache, Properties, Lock, Mail, UrlFetch, Utilities).
// Used by the automated tests and by the local development backend, so both exercise the real
// Apps Script code rather than a re-implementation.
//
// Only the API surface the script calls is imitated. Behaviour that matters for correctness is
// modelled faithfully: header-based rows, formulas from a leading "=", the apostrophe text
// prefix, row deletion, cache expiry and signed byte arrays from Utilities.
//
// Uses only Node built-ins and erasable TypeScript so `node` can run it directly.

import { createHash, createHmac, randomUUID } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

type Cell = string | number | boolean;

export interface HarnessSheet {
    name: string;
    cells: Cell[][];
    notes: Record<string, string>;
    formulas: Record<string, string>;
}

export interface HarnessStore {
    spreadsheetId: string;
    sheets: HarnessSheet[];
    properties: Record<string, string>;
    cache: Record<string, { value: string; exp: number }>;
    folders: Record<string, { id: string; name: string; parent: string | null; description: string }>;
    files: Record<string, { id: string; name: string; mime: string; folder: string; description: string; trashed: boolean; data: string }>;
    triggers: { handler: string; type: string }[];
    outbox: { to: string; subject: string; body: string; at: number }[];
    fetches: { url: string; payload: string; headers: Record<string, string>; at: number }[];
    mailQuota: number;
}

export interface HarnessOptions {
    /** The account the script runs as (the spreadsheet owner) */
    effectiveUser?: string;
    /** The account making an edit or running a menu item */
    activeUser?: string;
    now?: () => number;
    scriptPath?: string;
    /** Several files loaded into one global scope, like the files of one Apps Script project */
    scriptPaths?: string[];
    /** Answers UrlFetchApp requests (default: an empty 200 response) */
    fetchHandler?: (url: string, options: Record<string, unknown>) => { code: number; body: string };
    quiet?: boolean;
}

export function createStore(): HarnessStore {
    return {
        spreadsheetId: 'local-' + randomUUID(),
        sheets: [{ name: 'EVSociety Registrations', cells: [['registrationId', 'type', 'fullName', 'email']], notes: {}, formulas: {} }],
        properties: {},
        cache: {},
        folders: {},
        files: {},
        triggers: [],
        outbox: [],
        fetches: [],
        mailQuota: 100,
    };
}

const DEFAULT_SCRIPT = path.join(process.cwd(), 'google-apps-script', 'competition-platform.js');
const compiled = new Map<string, { mtime: number; script: vm.Script }>();

function loadScript(file: string): vm.Script {
    const mtime = statSync(file).mtimeMs;
    const hit = compiled.get(file);
    if (hit && hit.mtime === mtime) return hit.script;
    const script = new vm.Script(readFileSync(file, 'utf8'), { filename: file });
    compiled.set(file, { mtime, script });
    return script;
}

const toSigned = (buf: Buffer): number[] => Array.from(buf, (b) => (b > 127 ? b - 256 : b));
const fromBytes = (bytes: number[] | string): Buffer =>
    typeof bytes === 'string' ? Buffer.from(bytes, 'utf8') : Buffer.from(bytes.map((b) => (b + 256) % 256));

class MockBlob {
    bytes: number[];
    contentType: string;
    name: string;
    constructor(bytes: number[], contentType: string, name: string) {
        this.bytes = bytes;
        this.contentType = contentType;
        this.name = name;
    }
    getBytes() { return this.bytes.slice(); }
    getContentType() { return this.contentType; }
    getName() { return this.name; }
    setName(name: string) { this.name = name; return this; }
    getDataAsString() { return fromBytes(this.bytes).toString('utf8'); }
}

export function createAppsScriptRuntime(store: HarnessStore, options: HarnessOptions = {}) {
    const now = options.now || (() => Date.now());
    const effectiveUser = options.effectiveUser || 'owner@evsociety.test';
    let activeUser = options.activeUser ?? effectiveUser;
    const log = (...args: unknown[]) => { if (!options.quiet) console.log('[apps-script]', ...args); };

    const key = (r: number, c: number) => `${r}:${c}`;

    function sheetApi(sheet: HarnessSheet): any {
        const lastRow = () => {
            for (let r = sheet.cells.length - 1; r >= 0; r--) {
                if ((sheet.cells[r] || []).some((v) => v !== '' && v !== undefined && v !== null)) return r + 1;
            }
            return 0;
        };
        const lastColumn = () => sheet.cells.reduce((max, row) => {
            let last = 0;
            (row || []).forEach((v, i) => { if (v !== '' && v !== undefined && v !== null) last = i + 1; });
            return Math.max(max, last);
        }, 0);
        const setCell = (r: number, c: number, value: unknown) => {
            while (sheet.cells.length < r) sheet.cells.push([]);
            const row = sheet.cells[r - 1];
            while (row.length < c) row.push('');
            delete sheet.formulas[key(r, c)];
            if (value === null || value === undefined) { row[c - 1] = ''; return; }
            if (value instanceof Date) { row[c - 1] = value.toISOString(); return; }
            if (typeof value === 'string') {
                if (value.startsWith("'")) { row[c - 1] = value.slice(1); return; }
                if (value.startsWith('=')) {
                    // A real sheet would evaluate this; record it so tests can detect injection
                    sheet.formulas[key(r, c)] = value;
                    row[c - 1] = '#FORMULA';
                    return;
                }
                row[c - 1] = value;
                return;
            }
            row[c - 1] = value as Cell;
        };
        const getCell = (r: number, c: number): Cell => {
            const v = (sheet.cells[r - 1] || [])[c - 1];
            return v === undefined || v === null ? '' : v;
        };
        const rangeApi = (row: number, col: number, numRows = 1, numCols = 1): any => {
            const self: any = {
                getRow: () => row,
                getColumn: () => col,
                getNumRows: () => numRows,
                getNumColumns: () => numCols,
                getSheet: () => api,
                getValues: () => Array.from({ length: numRows }, (_, i) => Array.from({ length: numCols }, (_, j) => getCell(row + i, col + j))),
                getValue: () => getCell(row, col),
                setValues: (values: unknown[][]) => {
                    if (values.length !== numRows || values.some((v) => v.length !== numCols)) throw new Error('setValues: dimensions do not match the range');
                    values.forEach((vals, i) => vals.forEach((v, j) => setCell(row + i, col + j, v)));
                    return self;
                },
                setValue: (value: unknown) => {
                    for (let i = 0; i < numRows; i++) for (let j = 0; j < numCols; j++) setCell(row + i, col + j, value);
                    return self;
                },
                setNote: (note: string) => {
                    if (note) sheet.notes[key(row, col)] = note;
                    else delete sheet.notes[key(row, col)];
                    return self;
                },
                getNote: () => sheet.notes[key(row, col)] || '',
                setNumberFormat: () => self,
                setDataValidation: () => self,
                setFontWeight: () => self,
                setBackground: () => self,
                setFontColor: () => self,
                protect: () => {
                    let description = '';
                    const protection: any = {
                        setDescription: (d: string) => { description = d; return protection; },
                        getDescription: () => description,
                        addEditor: () => protection,
                        addEditors: () => protection,
                        removeEditors: () => protection,
                        getEditors: () => [],
                        canDomainEdit: () => false,
                        setDomainEdit: () => protection,
                        remove: () => undefined,
                    };
                    return protection;
                },
            };
            return self;
        };
        const api: any = {
            getName: () => sheet.name,
            getLastRow: lastRow,
            getLastColumn: lastColumn,
            getMaxRows: () => Math.max(1000, sheet.cells.length),
            getDataRange: () => rangeApi(1, 1, Math.max(1, lastRow()), Math.max(1, lastColumn())),
            getRange: (r: number, c: number, nr?: number, nc?: number) => rangeApi(r, c, nr ?? 1, nc ?? 1),
            appendRow: (values: unknown[]) => { const r = lastRow() + 1; values.forEach((v, i) => setCell(r, i + 1, v)); return api; },
            deleteRow: (r: number) => {
                sheet.cells.splice(r - 1, 1);
                const shift = (map: Record<string, string>) => {
                    const next: Record<string, string> = {};
                    Object.entries(map).forEach(([k, v]) => {
                        const [rr, cc] = k.split(':').map(Number);
                        if (rr === r) return;
                        next[key(rr > r ? rr - 1 : rr, cc)] = v;
                    });
                    return next;
                };
                sheet.notes = shift(sheet.notes);
                sheet.formulas = shift(sheet.formulas);
                return api;
            },
            setFrozenRows: () => api,
            getProtections: () => [],
            getActiveRange: () => rangeApi(2, 1),
        };
        return api;
    }

    const spreadsheet: any = {
        getId: () => store.spreadsheetId,
        getSheetByName: (name: string) => {
            const sheet = store.sheets.find((s) => s.name === name);
            return sheet ? sheetApi(sheet) : null;
        },
        insertSheet: (name: string) => {
            if (store.sheets.some((s) => s.name === name)) throw new Error(`A sheet with the name "${name}" already exists.`);
            const sheet: HarnessSheet = { name, cells: [], notes: {}, formulas: {} };
            store.sheets.push(sheet);
            return sheetApi(sheet);
        },
        getSheets: () => store.sheets.map(sheetApi),
        toast: (msg: string) => log('toast:', msg),
    };

    const ui = {
        alert: (...args: unknown[]) => { log('ui.alert:', ...args); return 'YES'; },
        createMenu: () => { const m: any = { addItem: () => m, addSeparator: () => m, addToUi: () => undefined }; return m; },
        ButtonSet: { YES_NO: 'YES_NO' },
        Button: { YES: 'YES', NO: 'NO' },
    };

    const SpreadsheetApp = {
        getActiveSpreadsheet: () => spreadsheet,
        getActive: () => spreadsheet,
        openById: (id: string) => {
            if (id !== store.spreadsheetId) throw new Error('Spreadsheet not found');
            return spreadsheet;
        },
        getActiveSheet: () => spreadsheet.getSheetByName('Teams'),
        getUi: () => ui,
        newDataValidation: () => {
            const b: any = { requireValueInList: () => b, setAllowInvalid: () => b, build: () => ({}) };
            return b;
        },
        ProtectionType: { RANGE: 'RANGE', SHEET: 'SHEET' },
    };

    const fileApi = (id: string): any => {
        const f = store.files[id];
        if (!f) throw new Error('File not found: ' + id);
        return {
            getId: () => f.id,
            getName: () => f.name,
            getMimeType: () => f.mime,
            getSize: () => Buffer.from(f.data, 'base64').length,
            getBlob: () => new MockBlob(toSigned(Buffer.from(f.data, 'base64')), f.mime, f.name),
            setTrashed: (t: boolean) => { f.trashed = t; },
            isTrashed: () => f.trashed,
            setDescription: (d: string) => { f.description = d; return fileApi(id); },
        };
    };
    const folderApi = (id: string): any => {
        const folder = store.folders[id];
        if (!folder) throw new Error('Folder not found: ' + id);
        return {
            getId: () => folder.id,
            getName: () => folder.name,
            setDescription: (d: string) => { folder.description = d; return folderApi(id); },
            createFolder: (name: string) => createFolder(name, id),
            getFoldersByName: (name: string) => {
                const matches = Object.values(store.folders).filter((f) => f.parent === id && f.name === name);
                let i = 0;
                return { hasNext: () => i < matches.length, next: () => folderApi(matches[i++].id) };
            },
            createFile: (blob: MockBlob) => {
                const fileId = 'drv_' + randomUUID().replace(/-/g, '');
                store.files[fileId] = { id: fileId, name: blob.getName(), mime: blob.getContentType(), folder: id, description: '', trashed: false, data: fromBytes(blob.getBytes()).toString('base64') };
                return fileApi(fileId);
            },
        };
    };
    const createFolder = (name: string, parent: string | null) => {
        const id = 'fld_' + randomUUID().replace(/-/g, '');
        store.folders[id] = { id, name, parent, description: '' };
        return folderApi(id);
    };
    const DriveApp = {
        createFolder: (name: string) => createFolder(name, null),
        getFolderById: folderApi,
        getFileById: fileApi,
    };

    const cacheApi = {
        get: (k: string) => {
            const hit = store.cache[k];
            if (!hit) return null;
            if (hit.exp < now()) { delete store.cache[k]; return null; }
            return hit.value;
        },
        put: (k: string, v: string, ttl = 600) => {
            if (String(v).length > 100 * 1024) throw new Error('Argument too large: value');
            store.cache[k] = { value: String(v), exp: now() + Math.min(ttl, 21600) * 1000 };
        },
        putAll: (values: Record<string, string>, ttl = 600) => { Object.entries(values).forEach(([k, v]) => cacheApi.put(k, v, ttl)); },
        getAll: (keys: string[]) => {
            const out: Record<string, string> = {};
            keys.forEach((k) => { const v = cacheApi.get(k); if (v !== null) out[k] = v; });
            return out;
        },
        remove: (k: string) => { delete store.cache[k]; },
        removeAll: (keys: string[]) => keys.forEach((k) => delete store.cache[k]),
    };

    const props = {
        getProperty: (k: string) => (k in store.properties ? store.properties[k] : null),
        setProperty: (k: string, v: string) => { store.properties[k] = String(v); return props; },
        deleteProperty: (k: string) => { delete store.properties[k]; return props; },
        getProperties: () => ({ ...store.properties }),
    };

    const Utilities = {
        DigestAlgorithm: { SHA_256: 'SHA_256' },
        computeHmacSha256Signature: (value: string | number[], secret: string | number[]) =>
            toSigned(createHmac('sha256', fromBytes(secret)).update(fromBytes(value)).digest()),
        computeDigest: (_alg: string, value: string | number[]) => toSigned(createHash('sha256').update(fromBytes(value)).digest()),
        base64Encode: (value: string | number[]) => fromBytes(value).toString('base64'),
        base64Decode: (value: string) => toSigned(Buffer.from(value, 'base64')),
        newBlob: (bytes: number[] | string, contentType: string, name: string) =>
            new MockBlob(typeof bytes === 'string' ? toSigned(Buffer.from(bytes, 'utf8')) : bytes, contentType, name),
        getUuid: () => randomUUID(),
        sleep: () => undefined,
    };

    const context: any = {
        console,
        Logger: { log: (msg: unknown) => log(msg) },
        SpreadsheetApp,
        DriveApp,
        Utilities,
        CacheService: { getScriptCache: () => cacheApi },
        PropertiesService: { getScriptProperties: () => props },
        LockService: { getScriptLock: () => ({ tryLock: () => true, waitLock: () => undefined, releaseLock: () => undefined, hasLock: () => true }) },
        MailApp: {
            getRemainingDailyQuota: () => store.mailQuota,
            sendEmail: (msg: any) => {
                if (store.mailQuota < 1) throw new Error('Service invoked too many times for one day: email.');
                store.mailQuota -= 1;
                store.outbox.push({ to: msg.to, subject: msg.subject, body: msg.body, at: now() });
                log(`mail to ${msg.to}: ${msg.subject}`);
            },
        },
        UrlFetchApp: {
            fetch: (url: string, opts: any = {}) => {
                store.fetches.push({ url, payload: String(opts.payload || ''), headers: opts.headers || {}, at: now() });
                const res = options.fetchHandler ? options.fetchHandler(url, opts) : { code: 200, body: '' };
                return { getResponseCode: () => res.code, getContentText: () => res.body };
            },
        },
        Session: {
            getActiveUser: () => ({ getEmail: () => activeUser }),
            getEffectiveUser: () => ({ getEmail: () => effectiveUser }),
            getScriptTimeZone: () => 'Asia/Kolkata',
        },
        ScriptApp: {
            getProjectTriggers: () => store.triggers.map((t) => ({ getHandlerFunction: () => t.handler })),
            newTrigger: (handler: string) => {
                const b: any = {
                    forSpreadsheet: () => b,
                    onEdit: () => { b.type = 'onEdit'; return b; },
                    onOpen: () => { b.type = 'onOpen'; return b; },
                    create: () => { store.triggers.push({ handler, type: b.type }); return {}; },
                };
                return b;
            },
        },
        ContentService: {
            MimeType: { JSON: 'JSON' },
            createTextOutput: (initial = '') => {
                let content = initial;
                const out: any = { setMimeType: () => out, setContent: (c: string) => { content = c; return out; }, getContent: () => content };
                return out;
            },
        },
    };
    vm.createContext(context);
    // The script reads time through Date.now(); tests can move the clock
    context.__harnessNow = now;
    vm.runInContext('Date.now = function () { return __harnessNow(); };', context);
    for (const file of options.scriptPaths ?? [options.scriptPath || DEFAULT_SCRIPT]) loadScript(file).runInContext(context);

    return {
        context,
        store,
        call<T = any>(fn: string, ...args: unknown[]): T {
            if (typeof context[fn] !== 'function') throw new Error('No such Apps Script function: ' + fn);
            // Round-trip through JSON so results never carry objects from the sandbox realm
            const result = context[fn](...args);
            return result === undefined ? (undefined as T) : JSON.parse(JSON.stringify(result));
        },
        setActiveUser(email: string) { activeUser = email; },
        sheet(name: string) {
            const sheet = store.sheets.find((s) => s.name === name);
            if (!sheet) throw new Error('No sheet ' + name);
            return sheet;
        },
        /** Rows of a tab as objects keyed by header */
        rows(name: string): Record<string, Cell>[] {
            const sheet = this.sheet(name);
            const [headers = [], ...rest] = sheet.cells;
            return rest
                .filter((r) => r.some((v) => v !== '' && v !== undefined))
                .map((r) => Object.fromEntries(headers.map((h, i) => [String(h), r[i] ?? ''])));
        },
        /**
         * Imitates a person typing a value into a cell and the installed edit trigger firing.
         * `user` is who Google reports as the editor ('' when it cannot identify them).
         */
        edit(tab: string, idColumn: string, id: string, column: string, value: string, user: string) {
            const sheet = this.sheet(tab);
            const headers = sheet.cells[0].map(String);
            const col = headers.indexOf(column) + 1;
            const idCol = headers.indexOf(idColumn);
            const rowIndex = sheet.cells.findIndex((r, i) => i > 0 && String(r[idCol]) === id);
            if (col < 1 || rowIndex < 1) throw new Error(`Cell not found: ${tab}.${column} for ${id}`);
            const api = spreadsheet.getSheetByName(tab);
            const range = api.getRange(rowIndex + 1, col);
            const oldValue = range.getValue();
            range.setValue(value);
            const previousActive = activeUser;
            activeUser = user;
            try {
                context.evsCompetitionOnEdit({ range, value, oldValue, user: { getEmail: () => user } });
            } finally {
                activeUser = previousActive;
            }
            return { note: range.getNote(), value: range.getValue() };
        },
    };
}

export type AppsScriptRuntime = ReturnType<typeof createAppsScriptRuntime>;
