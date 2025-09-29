'use client';

import { useState } from 'react';
import { getRentalStats } from '@/app/[location]/report/rental/rental.api';

interface StatsResult {
  success: boolean;
  data?: {
    total: number;
    active: number;
    overdue: number;
    returned: number;
  };
  message?: string;
  error?: string;
}

const Test = () => {
    const [statsResult, setStatsResult] = useState<StatsResult | null>(null);
    const [loading, setLoading] = useState(false);

    const testRentalStats = async () => {
        setLoading(true);
        try {
            // Test with a sample location
            const result = await getRentalStats('training-location');
            setStatsResult(result);
        } catch (error) {
            setStatsResult({ 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <div> Test Page | ENV </div>
        <pre>
        NEXT_PUBLIC_ENV: {process.env.NEXT_PUBLIC_ENV}
        {/* <br />
        NEXT_PUBLIC_API_URL: {process.env.NEXT_PUBLIC_API_URL}
        <br />
        NEXT_PUBLIC_LEGACY_URL: {process.env.NEXT_PUBLIC_LEGACY_URL}
        <br /> */}
        </pre>
        
        <div style={{ marginTop: '20px' }}>
            <h3>Rental Stats Test</h3>
            <button onClick={testRentalStats} disabled={loading}>
                {loading ? 'Testing...' : 'Test Rental Stats API'}
            </button>
            
            {statsResult && (
                <div style={{ marginTop: '10px' }}>
                    <h4>Result:</h4>
                    <pre>{JSON.stringify(statsResult, null, 2)}</pre>
                </div>
            )}
        </div>
        </>
    )
}

export default Test;