// Test script to debug the Admin API using curl.
// Usage: ADMIN_API_URL=https://script.google.com/macros/s/…/exec node test_admin_api.js
// With the Google ID token check in place, the fake token below must be refused
// ("Access denied. Invalid token."). If it returns registrations, the check is not deployed.
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const ADMIN_API_URL = process.env.ADMIN_API_URL;
if (!ADMIN_API_URL) {
    console.error('Set ADMIN_API_URL to the Apps Script web app URL.');
    process.exit(1);
}

async function testAdminAPI() {
    console.log('🔍 Testing Admin API...\n');
    console.log('URL:', ADMIN_API_URL);
    console.log('\n--- Test 1: Sending listRegistrations request ---');

    const payload = JSON.stringify({
        action: 'listRegistrations',
        filters: {},
        idToken: 'test-token-12345'
    });

    // Apps Script answers a POST with a redirect that must be followed with GET (as browsers do):
    // -L follows it, and --data without -X lets curl switch to GET for the redirect
    const curlCommand = `curl -sL "${ADMIN_API_URL}" -H "Content-Type: text/plain;charset=utf-8" --data '${payload}' -w "\\n\\nHTTP Status: %{http_code}\\n"`;

    try {
        console.log('Executing curl command...\n');
        const { stdout, stderr } = await execPromise(curlCommand);

        if (stderr) {
            console.error('Stderr:', stderr);
        }

        console.log('Response:');
        console.log(stdout);

        // Try to parse JSON from response
        const lines = stdout.split('\n');
        const jsonLine = lines.find(line => line.trim().startsWith('{'));

        if (jsonLine) {
            try {
                const data = JSON.parse(jsonLine);
                console.log('\n✅ Parsed JSON:');
                console.log('- ok:', data.ok);
                console.log('- error:', data.error);
                console.log('- total:', data.total);
                console.log('- data length:', data.data?.length);

                if (data.data && data.data.length > 0) {
                    console.log('\n✅ First registration:');
                    console.log(JSON.stringify(data.data[0], null, 2));
                }
            } catch (parseError) {
                console.error('❌ Failed to parse JSON:', parseError.message);
            }
        }

    } catch (error) {
        console.error('❌ Request failed:', error.message);
    }
}

testAdminAPI();
