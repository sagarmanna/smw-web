export const fetchStaffMemberInfo = async (id: string) => {
    return {
        "success": true,
        "data": {
            "profile": {
                "name": "John Doe",
                "role": "Staff Member",
            },
            "email": [
                {
                    "id": 5751,
                    "email": "john.doe@example.com",
                    "note": "",
                    "label": "Work",
                    "isPrimary": true
                }
            ],
            "phone": [
                {
                    "id": 10613,
                    "number": "(416) 589-6325",
                    "extension": null,
                    "note": "",
                    "label": "Home",
                    "isPrimary": false
                }
            ],
            "addresses": [
                {
                    "id": 6549,
                    "address": "4 sugar dr",
                    "city": "Brampton",
                    "province": "Ontario",
                    "country": "Canada",
                    "postalCode": "l8g3m5",
                    "label": "Home",
                    "isPrimary": false
                }
            ],
        },
        "message": "Staff member info retrieved successfully"
    }
};


export const fetchStaffMemberTabs = async (id: string) => {
    return {
        "success": true,
        "data": {   
            "tabs": [
                {
                    "id": 1,
                    "name": "Profile",
                    "icon": "profile",
                    "href": "/staffmembers/1/profile"
                }
            ],
            "content": [
                {
                    "id": 1,
                    "content": "Profile content"
                }
            ]
        },
        "message": "Staff member tabs retrieved successfully"
    }
};