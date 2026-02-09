// Test script to debug the Admin API using curl
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const ADMIN_API_URL = 'https://script.google.com/macros/s/AKfycbzexTstKRRYFOgNTNLURYbcWY9_xP-1uQ9xtydR4lz6FOq1Zgka4kGmO1bOCWmnHq9l/exec';

async function testAdminAPI() {
    console.log('🔍 Testing Admin API...\n');
    console.log('URL:', ADMIN_API_URL);
    console.log('\n--- Test 1: Sending listRegistrations request ---');

    const payload = JSON.stringify({
        action: 'listRegistrations',
        filters: {},
        idToken: 'test-token-12345'
    });

    const curlCommand = `curl -X POST "${ADMIN_API_URL}" -H "Content-Type: application/json" -d '${payload}' -w "\\n\\nHTTP Status: %{http_code}\\n" -s`;

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
