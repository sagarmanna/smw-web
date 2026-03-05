import { NextResponse } from 'next/server';

/** Sample CSV content – same as public/samples/user-import-sample.csv. Served with correct headers so the browser downloads as .csv */
const SAMPLE_CSV = `"First Name",Last Name,Date of Birth,Billing First Name,Billing Last Name,Email Address,Billing Email Address,Billing Address,Billing City,Billing Province,Billing Postal Code,Billing Country,Billing Home Tel,Billing Work Tel,Billing Work Tel Ext.,Billing Other Tel,Billing Other Tel Ext.,Address,City,Province,Postal Code,Country,Home Tel,Other Tel,Balance To Date,Comments
"Sofia",Chen,5/10/2014,Wei,Chen,wei.chen@example.com,wei.chen@example.com,88 River Rd,Mississauga,ON,L5B 2M2,Canada,647-555-0100,647-555-0101,,,,"88 River Rd",Mississauga,ON,L5B 2M2,Canada,647-555-0100,,0,Sample import - new customer 1
"Owen",Patel,11/3/2011,Priya,Patel,priya.patel@example.com,priya.patel@example.com,200 Queen St E,Toronto,ON,M5A 1A1,Canada,416-555-0200,,,,,"200 Queen St E",Toronto,ON,M5A 1A1,Canada,416-555-0200,,25,Sample import - new customer 2
`;

const FILENAME = 'user-import-sample.csv';

export async function GET() {
  return new NextResponse(SAMPLE_CSV, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${FILENAME}"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
