# FreelanceHub Contract Management API Documentation

## Overview
This document provides comprehensive API documentation for the contract management system, including automatic contract creation, manual contract creation, approval workflow, and PDF generation.

## Authentication
All endpoints require JWT authentication with `Authorization: Bearer <token>` header.

---

## 1. Contract Creation Workflow

### 1.1 Automatic Contract Creation (Primary Flow)
**Endpoint:** `POST /clients/projects/{projectId}/proposals/{proposalId}/accept`

**Purpose:** Accept a proposal and automatically create a contract

**Request:**
```http
POST /clients/projects/64f1a2b3c4d5e6f7g8h9i0j/proposals/64f1a2b3c4d5e6f7g8h9i0k/accept
Authorization: Bearer <client-jwt-token>
Content-Type: application/json

{
  "message": "I accept your proposal and look forward to working with you!"
}
```

**Success Response (201):**
```json
{
  "message": "Proposal accepted successfully. Contract created and awaiting client approval.",
  "contract": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0l",
    "projectId": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j",
      "title": "E-commerce Website Development",
      "description": "Build a modern e-commerce platform"
    },
    "clientId": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0m",
      "firstName": "John",
      "lastName": "Client",
      "email": "john@example.com"
    },
    "freelancerId": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0n",
      "firstName": "Jane",
      "lastName": "Freelancer",
      "email": "jane@example.com"
    },
    "proposalId": "64f1a2b3c4d5e6f7g8h9i0k",
    "terms": {
      "budget": 2500,
      "paymentType": "fixed",
      "startDate": "2025-09-01",
      "endDate": "2025-10-01",
      "paymentSchedule": "Upon milestone completion"
    },
    "milestones": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0o",
        "title": "Design Phase",
        "description": "Complete UI/UX design and wireframes",
        "amount": 500,
        "dueDate": "2025-09-15",
        "status": "pending"
      },
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0p",
        "title": "Development Phase",
        "description": "Implement frontend and backend",
        "amount": 1500,
        "dueDate": "2025-09-30",
        "status": "pending"
      },
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0q",
        "title": "Testing & Deployment",
        "description": "Testing, bug fixes, and deployment",
        "amount": 500,
        "dueDate": "2025-10-01",
        "status": "pending"
      }
    ],
    "status": "active",
    "approvalWorkflow": {
      "clientApproved": false,
      "freelancerApproved": false,
      "approvalOrder": "client_first"
    },
    "createdAt": "2025-09-01T10:00:00.000Z",
    "updatedAt": "2025-09-01T10:00:00.000Z"
  }
}
```

**Error Responses:**
```json
// 400 Bad Request - Proposal not found or not pending
{
  "statusCode": 400,
  "message": "Proposal has already been processed",
  "error": "Bad Request"
}

// 403 Forbidden - Not the project owner
{
  "statusCode": 403,
  "message": "You can only accept proposals for your own projects",
  "error": "Forbidden"
}

// 404 Not Found - Project or proposal not found
{
  "statusCode": 404,
  "message": "Project not found",
  "error": "Not Found"
}
```

### 1.2 Manual Contract Creation (Fallback)
**Endpoint:** `POST /contracts/from-proposal/{proposalId}`

**Purpose:** Manually create a contract from an accepted proposal (fallback when automatic creation fails)

**Request:**
```http
POST /contracts/from-proposal/64f1a2b3c4d5e6f7g8h9i0k
Authorization: Bearer <client-jwt-token>
```

**Success Response (201):**
```json
{
  "message": "Contract created successfully from proposal",
  "contract": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0l",
    "projectId": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j",
      "title": "E-commerce Website Development"
    },
    "clientId": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0m",
      "firstName": "John",
      "lastName": "Client"
    },
    "freelancerId": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0n",
      "firstName": "Jane",
      "lastName": "Freelancer"
    },
    "terms": {
      "budget": 2500,
      "paymentType": "fixed",
      "startDate": "2025-09-01",
      "endDate": "2025-10-01",
      "paymentSchedule": "Upon milestone completion"
    },
    "milestones": [...],
    "approvalWorkflow": {
      "clientApproved": false,
      "freelancerApproved": false,
      "approvalOrder": "client_first"
    }
  }
}
```

**Error Responses:**
```json
// 400 Bad Request - Proposal not accepted
{
  "statusCode": 400,
  "message": "Proposal must be accepted before creating contract",
  "error": "Bad Request"
}

// 403 Forbidden - Not authorized
{
  "statusCode": 403,
  "message": "You do not have permission to create contract for this proposal",
  "error": "Forbidden"
}

// 409 Conflict - Contract already exists
{
  "statusCode": 409,
  "message": "Contract already exists for this proposal",
  "error": "Conflict"
}
```

---

## 2. Contract Approval Workflow

### 2.1 Client Approval
**Endpoint:** `POST /contracts/{contractId}/approve/client`

**Purpose:** Client approves the contract (must be done first)

**Request:**
```http
POST /contracts/64f1a2b3c4d5e6f7g8h9i0l/approve/client
Authorization: Bearer <client-jwt-token>
```

**Success Response (200):**
```json
{
  "message": "Contract approved by client successfully",
  "contract": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0l",
    "approvalWorkflow": {
      "clientApproved": true,
      "freelancerApproved": false,
      "clientApprovedAt": "2025-09-01T10:30:00.000Z",
      "approvalOrder": "client_first"
    }
  }
}
```

### 2.2 Freelancer Approval
**Endpoint:** `POST /contracts/{contractId}/approve/freelancer`

**Purpose:** Freelancer approves the contract (only after client approval)

**Request:**
```http
POST /contracts/64f1a2b3c4d5e6f7g8h9i0l/approve/freelancer
Authorization: Bearer <freelancer-jwt-token>
```

**Success Response (200):**
```json
{
  "message": "Contract approved by freelancer successfully",
  "contract": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0l",
    "approvalWorkflow": {
      "clientApproved": true,
      "freelancerApproved": true,
      "clientApprovedAt": "2025-09-01T10:30:00.000Z",
      "freelancerApprovedAt": "2025-09-01T11:00:00.000Z",
      "approvalOrder": "client_first"
    },
    "pdfUrl": "https://api.yourapp.com/contracts/64f1a2b3c4d5e6f7g8h9i0l/pdf"
  }
}
```

**Note:** When both parties approve, a PDF is automatically generated and emails are sent to both parties.

---

## 3. Contract Viewing

### 3.1 Get User's Contracts
**Endpoint:** `GET /contracts`

**Purpose:** Get all contracts for the authenticated user (client or freelancer)

**Request:**
```http
GET /contracts?page=1&limit=10
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "contracts": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0l",
      "projectId": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j",
        "title": "E-commerce Website Development",
        "status": "in-progress"
      },
      "clientId": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0m",
        "firstName": "John",
        "lastName": "Client"
      },
      "freelancerId": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0n",
        "firstName": "Jane",
        "lastName": "Freelancer"
      },
      "terms": {
        "budget": 2500,
        "paymentType": "fixed"
      },
      "status": "active",
      "approvalWorkflow": {
        "clientApproved": true,
        "freelancerApproved": true
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### 3.2 Get Specific Contract
**Endpoint:** `GET /contracts/{contractId}`

**Purpose:** Get detailed information about a specific contract

**Request:**
```http
GET /contracts/64f1a2b3c4d5e6f7g8h9i0l
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "_id": "64f1a2b3c4d5e6f7g8h9i0l",
  "projectId": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j",
    "title": "E-commerce Website Development",
    "description": "Build a modern e-commerce platform"
  },
  "clientId": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0m",
    "firstName": "John",
    "lastName": "Client",
    "email": "john@example.com"
  },
  "freelancerId": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0n",
    "firstName": "Jane",
    "lastName": "Freelancer",
    "email": "jane@example.com"
  },
  "terms": {
    "budget": 2500,
    "paymentType": "fixed",
    "startDate": "2025-09-01",
    "endDate": "2025-10-01",
    "paymentSchedule": "Upon milestone completion"
  },
  "milestones": [...],
  "status": "active",
  "approvalWorkflow": {
    "clientApproved": true,
    "freelancerApproved": true,
    "clientApprovedAt": "2025-09-01T10:30:00.000Z",
    "freelancerApprovedAt": "2025-09-01T11:00:00.000Z"
  },
  "pdfUrl": "https://api.yourapp.com/contracts/64f1a2b3c4d5e6f7g8h9i0l/pdf"
}
```

### 3.3 Freelancer Contract View
**Endpoint:** `GET /contracts/{contractId}/freelancer-view`

**Purpose:** Freelancer can view contract only after client approval

**Request:**
```http
GET /contracts/64f1a2b3c4d5e6f7g8h9i0l/freelancer-view
Authorization: Bearer <freelancer-jwt-token>
```

**Success Response (200):** Same as GET /contracts/{contractId}

**Error Response (403) - Client not approved yet:**
```json
{
  "statusCode": 403,
  "message": "You do not have permission to view this contract",
  "error": "Forbidden"
}
```

---

## 4. PDF Download

### 4.1 Download Contract PDF
**Endpoint:** `GET /contracts/{contractId}/download-pdf`

**Purpose:** Download the signed contract as PDF (only when both parties have approved)

**Request:**
```http
GET /contracts/64f1a2b3c4d5e6f7g8h9i0l/download-pdf
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "pdfUrl": "https://api.yourapp.com/contracts/64f1a2b3c4d5e6f7g8h9i0l/pdf"
}
```

**Error Response (400) - Contract not fully approved:**
```json
{
  "statusCode": 400,
  "message": "Contract must be approved by both parties before downloading PDF",
  "error": "Bad Request"
}
```

---

## 5. Frontend Implementation Guide

### 5.1 Contract Creation Flow

```javascript
// 1. Accept Proposal (triggers automatic contract creation)
const acceptProposal = async (projectId, proposalId, message) => {
  try {
    const response = await fetch(`/clients/projects/${projectId}/proposals/${proposalId}/accept`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });

    const data = await response.json();

    if (response.ok) {
      // Contract created automatically
      console.log('Contract created:', data.contract);
      // Show contract approval UI
      showContractApproval(data.contract);
    } else {
      // If automatic creation fails, try manual creation
      if (data.message.includes('failed')) {
        await createContractManually(proposalId);
      }
    }
  } catch (error) {
    console.error('Error accepting proposal:', error);
  }
};

// 2. Manual Contract Creation (fallback)
const createContractManually = async (proposalId) => {
  try {
    const response = await fetch(`/contracts/from-proposal/${proposalId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Contract created manually:', data.contract);
      showContractApproval(data.contract);
    }
  } catch (error) {
    console.error('Error creating contract manually:', error);
  }
};
```

### 5.2 Contract Approval Flow

```javascript
// Client approves contract
const approveContractAsClient = async (contractId) => {
  try {
    const response = await fetch(`/contracts/${contractId}/approve/client`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Contract approved by client');
      // Notify freelancer and show next steps
      notifyFreelancerForApproval(contractId);
    }
  } catch (error) {
    console.error('Error approving contract:', error);
  }
};

// Freelancer approves contract
const approveContractAsFreelancer = async (contractId) => {
  try {
    const response = await fetch(`/contracts/${contractId}/approve/freelancer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Contract approved by freelancer');
      // PDF will be generated automatically
      // Emails will be sent to both parties
      showContractFinalized(data.contract);
    }
  } catch (error) {
    console.error('Error approving contract:', error);
  }
};
```

### 5.3 Contract Viewing and PDF Download

```javascript
// Get user's contracts
const getUserContracts = async (page = 1, limit = 10) => {
  try {
    const response = await fetch(`/contracts?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      return data.contracts;
    }
  } catch (error) {
    console.error('Error fetching contracts:', error);
  }
};

// Download contract PDF
const downloadContractPDF = async (contractId) => {
  try {
    const response = await fetch(`/contracts/${contractId}/download-pdf`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      // Open PDF in new tab or download
      window.open(data.pdfUrl, '_blank');
    }
  } catch (error) {
    console.error('Error downloading PDF:', error);
  }
};
```

### 5.4 UI State Management

```javascript
// Contract approval states
const CONTRACT_STATES = {
  PENDING_CLIENT_APPROVAL: 'pending_client_approval',
  PENDING_FREELANCER_APPROVAL: 'pending_freelancer_approval',
  APPROVED: 'approved',
  PDF_AVAILABLE: 'pdf_available'
};

// Determine contract state
const getContractState = (contract) => {
  const { clientApproved, freelancerApproved } = contract.approvalWorkflow;

  if (!clientApproved && !freelancerApproved) {
    return CONTRACT_STATES.PENDING_CLIENT_APPROVAL;
  }

  if (clientApproved && !freelancerApproved) {
    return CONTRACT_STATES.PENDING_FREELANCER_APPROVAL;
  }

  if (clientApproved && freelancerApproved) {
    return contract.pdfUrl ? CONTRACT_STATES.PDF_AVAILABLE : CONTRACT_STATES.APPROVED;
  }
};
```

---

## 6. Email Notifications

The system automatically sends the following emails:

1. **Contract Ready for Approval**: Sent to freelancer when client approves
2. **Contract Signed**: PDF attachment sent to both parties when both approve

**Email Content:**
- Subject: `Contract Signed: [Project Title]`
- Attachment: `contract-[contractId].pdf`
- Body: Confirmation that contract is signed and PDF is attached

---

## 7. Error Handling

### Common Error Codes:
- `400`: Bad Request (invalid data, proposal not accepted)
- `403`: Forbidden (no permission, wrong user type)
- `404`: Not Found (contract/proposal/project doesn't exist)
- `409`: Conflict (contract already exists)
- `500`: Internal Server Error (PDF generation failed, email sending failed)

### Frontend Error Handling:
```javascript
const handleApiError = (error) => {
  switch (error.statusCode) {
    case 400:
      showToast('Invalid request. Please check your data.');
      break;
    case 403:
      showToast('You do not have permission to perform this action.');
      break;
    case 409:
      showToast('Contract already exists for this proposal.');
      break;
    default:
      showToast('An error occurred. Please try again.');
  }
};
```

---

## 8. API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/clients/projects/{projectId}/proposals/{proposalId}/accept` | Accept proposal & auto-create contract | Client |
| POST | `/contracts/from-proposal/{proposalId}` | Manual contract creation | Client |
| POST | `/contracts/{contractId}/approve/client` | Client approves contract | Client |
| POST | `/contracts/{contractId}/approve/freelancer` | Freelancer approves contract | Freelancer |
| GET | `/contracts` | Get user's contracts | Client/Freelancer |
| GET | `/contracts/{contractId}` | Get specific contract | Client/Freelancer |
| GET | `/contracts/{contractId}/freelancer-view` | Freelancer views contract | Freelancer |
| GET | `/contracts/{contractId}/download-pdf` | Download contract PDF | Client/Freelancer |

---

## 9. Data Models

### Contract Schema
```typescript
{
  _id: string;
  projectId: ObjectId;
  clientId: ObjectId;
  freelancerId: ObjectId;
  proposalId: ObjectId;
  terms: {
    budget: number;
    paymentType: 'fixed' | 'hourly';
    startDate: string;
    endDate: string;
    paymentSchedule: string;
  };
  milestones: Array<{
    _id: string;
    title: string;
    description: string;
    amount: number;
    dueDate: string;
    status: 'pending' | 'in-progress' | 'submitted' | 'approved' | 'rejected';
  }>;
  status: 'active' | 'completed' | 'cancelled' | 'disputed';
  approvalWorkflow: {
    clientApproved: boolean;
    freelancerApproved: boolean;
    clientApprovedAt?: Date;
    freelancerApprovedAt?: Date;
    approvalOrder: 'client_first' | 'freelancer_first';
  };
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 10. Workflow States

### Contract States:
1. **Created**: Contract created, awaiting client approval
2. **Client Approved**: Client approved, awaiting freelancer approval
3. **Freelancer Approved**: Both approved, PDF generated
4. **PDF Available**: PDF generated and available for download

### Approval Order:
- **Client First**: Client must approve before freelancer can see contract
- **Freelancer First**: (Future enhancement)

---

## 11. Security Considerations

- All endpoints require JWT authentication
- Users can only access contracts they are party to
- Freelancers can only view contracts after client approval
- PDF download requires both parties to have approved
- All contract modifications are audited with timestamps

---

## 12. Future Enhancements

- Contract templates customization
- Digital signature integration
- Contract amendment workflow
- Automated contract renewal
- Multi-language contract support
- Contract analytics and reporting

---

*Last Updated: September 1, 2025*
*Version: 1.0*</content>
<parameter name="filePath">c:\Users\dilsh\OneDrive\Desktop\freelance\freelancehub-backend\CONTRACT_API_DOCUMENTATION.md
