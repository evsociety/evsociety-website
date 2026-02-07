/**
 * Google Apps Script for EVSociety Registration System
 * 
 * SETUP INSTRUCTIONS:
 * 
 * 1. Create a new Google Sheet named "EVSociety Registrations"
 * 
 * 2. Add the following headers in the first row:
 *    registrationId | type | role | itemTitle | fullName | email | phone | city | state | 
 *    organization | designation | linkedinUrl | participationMode | consent | newsletter |
 *    guestCategory | topic | reference | specialRequirements | skillAreas | interestLevel |
 *    participantType | experienceLevel | sessionTrack | questions | timestamp
 * 
 * 3. Go to Extensions > Apps Script
 * 
 * 4. Delete the default code and paste this entire script
 * 
 * 5. Save the project (name it "EVSociety Registration Handler")
 * 
 * 6. Deploy as Web App:
 *    - Click "Deploy" > "New deployment"
 *    - Select type: "Web app"
 *    - Description: "EVSociety Registration API"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (this allows the website to send data)
 *    - Click "Deploy"
 * 
 * 7. Copy the Web App URL
 * 
 * 8. Add to your .env.local file:
 *    NEXT_PUBLIC_REGISTRATION_API_URL=your_web_app_url_here
 * 
 * 9. Restart your Next.js dev server
 */

// Main function to handle POST requests
function doPost(e) {
    try {
        // Parse the incoming JSON data
        const data = JSON.parse(e.postData.contents);

        // Get the active spreadsheet
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

        // Prepare the row data (must match the order of headers)
        const row = [
            data.registrationId || '',
            data.type || '',
            data.role || '',
            data.itemTitle || '',
            data.fullName || '',
            data.email || '',
            data.phone || '',
            data.city || '',
            data.state || '',
            data.organization || '',
            data.designation || '',
            data.linkedinUrl || '',
            data.participationMode || '',
            data.consent ? 'Yes' : 'No',
            data.newsletter ? 'Yes' : 'No',
            // Guest-specific fields
            data.guestCategory || '',
            data.topic || '',
            data.reference || '',
            data.specialRequirements || '',
            // Project-specific fields
            data.skillAreas || '',
            data.interestLevel || '',
            // Program-specific fields
            data.participantType || '',
            data.experienceLevel || '',
            // Event/Webinar-specific fields
            data.sessionTrack || '',
            data.questions || '',
            // Timestamp
            data.timestamp || new Date().toISOString()
        ];

        // Append the row to the sheet
        sheet.appendRow(row);

        // Log success
        Logger.log('Registration added: ' + data.registrationId);

        // Return success response
        return ContentService
            .createTextOutput(JSON.stringify({
                success: true,
                registrationId: data.registrationId
            }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        // Log the error
        Logger.log('Error: ' + error.toString());

        // Return error response
        return ContentService
            .createTextOutput(JSON.stringify({
                success: false,
                error: error.toString()
            }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

// Test function (optional - for testing in Apps Script editor)
function testDoPost() {
    const testData = {
        postData: {
            contents: JSON.stringify({
                registrationId: 'EVS-20260207-12345',
                type: 'events',
                role: 'attendee',
                itemTitle: 'Test Event',
                fullName: 'Test User',
                email: 'test@example.com',
                phone: '+91 9876543210',
                city: 'Bengaluru',
                state: 'Karnataka',
                organization: 'Test Company',
                designation: 'Software Engineer',
                linkedinUrl: '',
                participationMode: 'online',
                consent: true,
                newsletter: false,
                guestCategory: '',
                topic: '',
                reference: '',
                specialRequirements: '',
                skillAreas: '',
                interestLevel: '',
                participantType: '',
                experienceLevel: '',
                sessionTrack: '',
                questions: '',
                timestamp: new Date().toISOString()
            })
        }
    };

    const result = doPost(testData);
    Logger.log(result.getContent());
}
