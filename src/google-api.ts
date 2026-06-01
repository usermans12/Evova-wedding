import { GuestWish, WeddingData } from "./types";

/**
 * Google Workspace API helper service
 */

// 1. Google Sheets Integration: Export RSVP Wishes
export async function exportRSVPsToGoogleSheets(
  accessToken: string,
  groomName: string,
  brideName: string,
  wishes: GuestWish[]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  try {
    // A. Create a new Spreadsheet
    const title = `Daftar RSVP Pernikahan - ${groomName} & ${brideName}`;
    const createResponse = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          title: title,
        },
      }),
    });

    if (!createResponse.ok) {
      const errText = await createResponse.text();
      throw new Error(`Gagal membuat spreadsheet: ${errText}`);
    }

    const spreadsheet = await createResponse.json();
    const spreadsheetId = spreadsheet.spreadsheetId;
    const spreadsheetUrl = spreadsheet.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

    // B. Build Row Data
    const headers = ["ID", "Nama Tamu", "Kehadiran RSVP", "Ucapan / Doa Restu", "Waktu Pengiriman"];
    const rows = wishes.map((wish) => [
      wish.id,
      wish.name || "Tamu Tanpa Nama",
      wish.attendance || "Hadir",
      wish.wish || "",
      wish.createdAt || "",
    ]);

    const values = [headers, ...rows];

    // C. Write rows to Worksheet
    const range = "Sheet1!A1";
    const updateResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: values,
        }),
      }
    );

    if (!updateResponse.ok) {
      const errText = await updateResponse.text();
      throw new Error(`Gagal mengisi baris spreadsheet: ${errText}`);
    }

    return { spreadsheetId, spreadsheetUrl };
  } catch (error) {
    console.error("Error exporting to Google Sheets:", error);
    throw error;
  }
}

// 2. Google Drive Integration: Backup Wedding JSON
export async function backupWeddingToGoogleDrive(
  accessToken: string,
  groomName: string,
  weddingData: WeddingData
): Promise<{ fileId: string; webViewLink: string }> {
  try {
    // A. Create empty file metadata
    const name = `evova_wedding_backup_${groomName.toLowerCase().replace(/\s+/g, "_")}.json`;
    const metadataResponse = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        mimeType: "application/json",
        description: "Salinan cadangan otomatis data undangan pernikahan digital EVOVA",
      }),
    });

    if (!metadataResponse.ok) {
      const errText = await metadataResponse.text();
      throw new Error(`Gagal menginisiasi berkas Drive: ${errText}`);
    }

    const fileMeta = await metadataResponse.json();
    const fileId = fileMeta.id;

    // B. Upload Content to file
    const contentResponse = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(weddingData, null, 2),
      }
    );

    if (!contentResponse.ok) {
      const errText = await contentResponse.text();
      throw new Error(`Gagal mengunggah konten Backup ke Google Drive: ${errText}`);
    }

    const webViewLink = `https://drive.google.com/open?id=${fileId}`;
    return { fileId, webViewLink };
  } catch (error) {
    console.error("Error backing up to Google Drive:", error);
    throw error;
  }
}

// 3. Google Contacts Integration: Find and import contacts
export interface ImportableContact {
  name: string;
  email: string;
  phone: string;
}

export async function fetchGoogleContacts(accessToken: string): Promise<ImportableContact[]> {
  try {
    const res = await fetch(
      "https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers&pageSize=100",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const connections = data.connections || [];

    const parsedContacts: ImportableContact[] = connections.map((conn: any) => {
      const nameObj = conn.names?.[0];
      const displayName = nameObj?.displayName || "Tanpa Nama";
      const email = conn.emailAddresses?.[0]?.value || "";
      const phone = conn.phoneNumbers?.[0]?.value || "";

      return {
        name: displayName,
        email: email,
        phone: phone,
      };
    });

    return parsedContacts;
  } catch (error) {
    console.error("Error fetching google contacts:", error);
    throw error;
  }
}
