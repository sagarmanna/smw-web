'use client';

import { use, useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { fetchStaffMember, fetchStaffMemberTabs } from './staffmembers.slice';
import StaffmembersDetailsClient from './StaffmembersDetailsClient';

export default function StaffMemberPage({ params }: { params: Promise<{ id: string, location: string }> }) {
    const { id, location } = use(params);

    // Fetch staff member details and tabs from API and store in Redux state
    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(fetchStaffMember(id));
        dispatch(fetchStaffMemberTabs(id));
    }, [id, dispatch]);

    // Render the client component that displays the details
    return <StaffmembersDetailsClient location={location} />;
}