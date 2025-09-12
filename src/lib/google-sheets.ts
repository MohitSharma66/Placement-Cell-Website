import { google } from 'googleapis';

// Google Sheets service for logging job applications
export class GoogleSheetsService {
  private sheets: any;
  private auth: any;
  private ready: Promise<void>;

  constructor() {
    this.ready = this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      // Check if Google service account credentials are available
      const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
      
      if (!credentials) {
        console.log('Google Sheets: No service account credentials found');
        return;
      }

      // Parse the service account key
      const serviceAccountKey = JSON.parse(credentials);
      
      // Create JWT auth client
      this.auth = new google.auth.JWT(
        serviceAccountKey.client_email,
        undefined,
        serviceAccountKey.private_key,
        ['https://www.googleapis.com/auth/spreadsheets']
      );

      // Initialize the sheets API
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      
      console.log('Google Sheets service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Sheets service:', error);
    }
  }

  async logJobApplication(applicationData: {
    studentName: string;
    studentEmail: string;
    jobTitle: string;
    companyName: string;
    applicationDate: string;
    resumeLink: string;
    status: string;
    studentBranch?: string;
    studentCgpa?: number;
  }) {
    try {
      // Wait for service to be ready
      await this.ready;
      
      // Skip if service is not initialized
      if (!this.sheets || !this.auth) {
        console.log('Google Sheets service not available - skipping log');
        return;
      }

      const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
      
      if (!spreadsheetId) {
        console.log('Google Sheets ID not configured - skipping log');
        return;
      }

      // Prepare the row data
      const rowData = [
        new Date().toLocaleString(), // Timestamp
        applicationData.studentName,
        applicationData.studentEmail,
        applicationData.studentBranch || '',
        applicationData.studentCgpa?.toString() || '',
        applicationData.jobTitle,
        applicationData.companyName,
        applicationData.applicationDate,
        applicationData.resumeLink,
        applicationData.status
      ];

      // Try to append the row to the sheet
      try {
        const result = await this.sheets.spreadsheets.values.append({
          spreadsheetId,
          range: 'Applications!A:J', // Adjust range as needed
          valueInputOption: 'RAW',
          resource: {
            values: [rowData]
          }
        });

        console.log('Successfully logged application to Google Sheets:', {
          student: applicationData.studentName,
          job: applicationData.jobTitle,
          company: applicationData.companyName,
          updatedRange: result.data.updates?.updatedRange
        });
      } catch (appendError: any) {
        // If sheet doesn't exist or has issues, try to create headers and retry
        if (appendError.code === 400 || appendError.message?.includes('Unable to parse range')) {
          console.log('Creating sheet headers and retrying...');
          await this.createSampleSheet();
          
          // Retry the append
          const result = await this.sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Applications!A:J',
            valueInputOption: 'RAW',
            resource: {
              values: [rowData]
            }
          });

          console.log('Successfully logged application to Google Sheets after creating headers:', {
            student: applicationData.studentName,
            job: applicationData.jobTitle,
            company: applicationData.companyName,
            updatedRange: result.data.updates?.updatedRange
          });
        } else {
          throw appendError;
        }
      }

    } catch (error) {
      console.error('Error logging to Google Sheets:', error);
      // Don't throw error - we don't want to break the application flow
    }
  }

  async createSampleSheet() {
    try {
      if (!this.sheets || !this.auth) {
        throw new Error('Google Sheets service not initialized');
      }

      const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
      
      if (!spreadsheetId) {
        throw new Error('Google Sheets ID not configured');
      }

      // Create headers for the applications sheet
      const headers = [
        'Timestamp',
        'Student Name', 
        'Student Email',
        'Branch',
        'CGPA',
        'Job Title',
        'Company',
        'Application Date',
        'Resume Link',
        'Status'
      ];

      // Try to add headers (this will fail if sheet already has data, which is fine)
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Applications!A1:J1',
        valueInputOption: 'RAW',
        resource: {
          values: [headers]
        }
      });

      console.log('Successfully set up Google Sheets headers');
      return true;
    } catch (error) {
      console.log('Headers may already exist or sheet setup failed:', error.message);
      return false;
    }
  }
}

// Export a singleton instance
export const googleSheetsService = new GoogleSheetsService();