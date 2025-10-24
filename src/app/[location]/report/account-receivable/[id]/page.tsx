import React from 'react'

interface PageProps {
  params: Promise<{ id: string; location: string }>;
}

const AccountReceivablePage = async ({ params }: PageProps) => {
    const { id, location } = await params;
    
    return (
        <div>
            <div>
                <h1>Account Receivable {id}</h1>
                <p>Location: {location}</p>
            </div>
        </div>
    )
}

export default AccountReceivablePage;