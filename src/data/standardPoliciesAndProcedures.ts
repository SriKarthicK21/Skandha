import { GeneratedDocument } from '../types';
import { enrichDocumentWithConsultancyFeatures } from '../services/consultancyDocumentEngine';

export function getFormattedCompanySpaced(companyName: string): string {
  const clean = companyName.trim().toUpperCase();
  return clean.split('').join(' ');
}

export function generateStandardISMSDocuments(
  companyName: string = 'ACME Global Enterprise',
  framework: string = 'ISO/IEC 27001:2022'
): GeneratedDocument[] {
  const effectiveDateDefault = '25 July 2025';

  const defaultControlStatements = [
    `This document is the sole property of ${companyName} and shall not be reproduced or photocopied, in part or in whole, without the approval of the Chief Information Security Officer (CISO).`,
    `It is distributed to the holder on the understanding that it shall be maintained in good order and shall not be subjected to manual correction.`,
    `Amendments to this document, if any, shall be submitted to the CISO for review and approval, and shall be made only by the CISO.`
  ];

  const defaultRevisionHistory = [
    {
      sNo: '01',
      reviewDate: '—',
      pageNo: 'All',
      issueNo: '1.0',
      changeDescription: 'Initial creation',
      approvedBy: 'CISO'
    }
  ];

  // 1. ACCESS CONTROL POLICY (ARP_ISMS_P11) - 16 Pages exact match
  const accessControlPolicy: GeneratedDocument = {
    id: 'doc_pol_access_control',
    docCode: 'ARP_ISMS_P11',
    title: 'Access Control Policy',
    type: 'POLICY',
    category: 'Identity & Access Management',
    version: '1.0',
    status: 'APPROVED',
    owner: 'Chief Information Security Officer (CISO)',
    approver: 'Chief Information Security Officer (CISO)',
    effectiveDate: '25 July 2025',
    reviewCycle: 'Annual',
    classification: 'Private (Internal)',
    standard: framework,
    documentOwner: 'Chief Information Security Officer (CISO)',
    issuedBy: 'TL / Manager',
    approvedBy: 'Chief Information Security Officer (CISO)',
    acknowledgementCount: 14,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: 'Purpose', pageNo: 5, level: 1 },
      { title: 'Who Needs to Know This Policy', pageNo: 5, level: 2 },
      { title: 'Objective', pageNo: 5, level: 1 },
      { title: 'Scope', pageNo: 5, level: 1 },
      { title: 'Policy', pageNo: 5, level: 1 },
      { title: 'Access Creation Procedure', pageNo: 6, level: 2 },
      { title: 'Types of Access Control', pageNo: 7, level: 2 },
      { title: 'Access Control Rules', pageNo: 8, level: 2 },
      { title: 'Access to networks and network services', pageNo: 8, level: 2 },
      { title: 'Access rights to third parties', pageNo: 8, level: 2 },
      { title: 'User Account Management', pageNo: 9, level: 2 },
      { title: 'User registration and de-registration', pageNo: 9, level: 3 },
      { title: 'User access provisioning', pageNo: 10, level: 3 },
      { title: 'Management of privileged access rights', pageNo: 10, level: 3 },
      { title: 'Review of user access rights', pageNo: 11, level: 3 },
      { title: 'Removal of access rights', pageNo: 11, level: 3 },
      { title: 'Use of secret authentication information', pageNo: 11, level: 3 },
      { title: 'Access Enforcement', pageNo: 12, level: 2 },
      { title: 'Information Flow Enforcement', pageNo: 12, level: 2 },
      { title: 'Separation of Duties', pageNo: 13, level: 2 },
      { title: 'Least Privilege', pageNo: 13, level: 2 },
      { title: 'System Usage Notification', pageNo: 13, level: 2 },
      { title: 'System and application access control', pageNo: 13, level: 2 },
      { title: 'Secure log-on procedures', pageNo: 14, level: 2 },
      { title: 'Use of privileged utility programs', pageNo: 14, level: 2 },
      { title: 'Access control to program source code', pageNo: 15, level: 2 },
      { title: 'Validity and Document Management', pageNo: 15, level: 1 },
      { title: 'Enforcement', pageNo: 16, level: 1 },
      { title: 'Distribution', pageNo: 16, level: 1 }
    ],
    pages: [
      {
        pageNumber: 5,
        title: 'Purpose & Policy Principles',
        content: `Purpose
The purpose of this policy is to define rules for access to various systems, equipment, facilities and information, based on business and security requirements for access in ${companyName} Technologies Private Limited. This policy manages risks from user account management, access enforcement, and monitoring, separation of duties, and remote access through the establishment of an access control process.

Who Needs to Know This Policy
▪ Top Management
▪ IT Security Team / Network Administrators
▪ Operations / Engineering Manager
▪ Incident Management / Business Continuity Team
▪ Security Consultants

Objective
The objective of this policy is to establish an access control capability throughout ${companyName} and its business units to help the organization implement security best practices with regard to logical security, accounts management, and remote access.

Scope
The scope of this policy is applicable to all information technology (IT) resources owned or operated by ${companyName}. Any information, not specifically identified as the property of other parties that is transmitted or stored on ${companyName} IT resources including e-mail, messages, and files are the property of ${companyName}. All users of ${companyName} including employees, contractors, vendors or suppliers IT resources are responsible for adhering to this policy.

Policy
Access control is the selective restriction of access to a place or other system/network resource in ${companyName} technologies. It protects information assets by determining who can and cannot access them. It involves user identification, authentication, authorization and accountability.

Asset owners should determine appropriate access control rules, access rights and restrictions for specific user roles towards their assets, with the amount of detail and the strictness of the controls reflecting the associated information security risks.`,
        sections: [
          {
            heading: 'Purpose',
            body: `The purpose of this policy is to define rules for access to various systems, equipment, facilities and information, based on business and security requirements for access in ${companyName} Technologies Private Limited. This policy manages risks from user account management, access enforcement, and monitoring, separation of duties, and remote access through the establishment of an access control process.`
          },
          {
            heading: 'Who Needs to Know This Policy',
            bullets: [
              'Top Management',
              'IT Security Team / Network Administrators',
              'Operations / Engineering Manager',
              'Incident Management / Business Continuity Team',
              'Security Consultants'
            ]
          },
          {
            heading: 'Objective',
            body: `The objective of this policy is to establish an access control capability throughout ${companyName} and its business units to help the organization implement security best practices with regard to logical security, accounts management, and remote access.`
          },
          {
            heading: 'Scope',
            body: `The scope of this policy is applicable to all information technology (IT) resources owned or operated by ${companyName}. Any information, not specifically identified as the property of other parties that is transmitted or stored on ${companyName} IT resources including e-mail, messages, and files are the property of ${companyName}. All users of ${companyName} including employees, contractors, vendors or suppliers IT resources are responsible for adhering to this policy.`
          },
          {
            heading: 'Policy',
            body: `Access control is the selective restriction of access to a place or other system/network resource in ${companyName} technologies. It protects information assets by determining who can and cannot access them. It involves user identification, authentication, authorization and accountability.

Asset owners should determine appropriate access control rules, access rights and restrictions for specific user roles towards their assets, with the amount of detail and the strictness of the controls reflecting the associated information security risks.`
          }
        ]
      },
      {
        pageNumber: 6,
        title: 'Access Control Policy Factors & Access Creation Procedure',
        content: `Access controls are both logical and physical and these should be considered together. Users and service providers should be given a clear statement of the business requirements to be met by access controls.

Asset owners shall ensure that access is provided for business purposes and is restricted to the minimum required to perform the job role and responsibilities. Asset owners shall ensure that responsibilities of individual employees are clearly defined to avoid an overlap in the functions performed by them. That requires high levels of privileges to be segregated to reduce the risk of information loss and corruption.

Following are considered while creating an access control policy:
▪ security requirements of business applications
▪ policies for information dissemination and authorization, e.g. the need-to-know principle and information security levels and classification of information
▪ removal of access rights
▪ roles with privileged access
▪ consistency between the access rights and information classification policies of systems and networks
▪ relevant legislation and any contractual obligations regarding limitation of access to data or services
▪ management of access rights in a distributed and networked environment which recognizes all types of connections available
▪ segregation of access control roles like access request, access authorization, access administration
▪ requirements for formal authorization of access requests
▪ requirements for periodic review of access rights
▪ archiving of records of all significant events concerning the use and management of user identities and secret authentication information

Access Creation Procedure
▪ After successful completion of Onboarding of a new employee for the project, he/she will fill out a form and send it to the HR Team for creating access. Form which contains below fields:
a. Employee Name
b. Expected Start Date/Date Required By
c. Employee Title
d. Employee Department/LOB/Department
e. Email Address
f. Hiring Manager(Approver)/Supervisors Name
g. Account Access Required
h. Accounts Needed`,
        sections: [
          {
            body: `Access controls are both logical and physical and these should be considered together. Users and service providers should be given a clear statement of the business requirements to be met by access controls.

Asset owners shall ensure that access is provided for business purposes and is restricted to the minimum required to perform the job role and responsibilities. Asset owners shall ensure that responsibilities of individual employees are clearly defined to avoid an overlap in the functions performed by them. That requires high levels of privileges to be segregated to reduce the risk of information loss and corruption.`
          },
          {
            heading: 'Following are considered while creating an access control policy:',
            bullets: [
              'security requirements of business applications',
              'policies for information dissemination and authorization, e.g. the need-to-know principle and information security levels and classification of information',
              'removal of access rights',
              'roles with privileged access',
              'consistency between the access rights and information classification policies of systems and networks',
              'relevant legislation and any contractual obligations regarding limitation of access to data or services',
              'management of access rights in a distributed and networked environment which recognizes all types of connections available',
              'segregation of access control roles like access request, access authorization, access administration',
              'requirements for formal authorization of access requests',
              'requirements for periodic review of access rights',
              'archiving of records of all significant events concerning the use and management of user identities and secret authentication information'
            ]
          },
          {
            heading: 'Access Creation Procedure',
            body: '▪ After successful completion of Onboarding of a new employee for the project, he/she will fill out a form and send it to the HR Team for creating access. Form which contains below fields:',
            letteredItems: [
              'Employee Name',
              'Expected Start Date/Date Required By',
              'Employee Title',
              'Employee Department/LOB/Department',
              'Email Address',
              'Hiring Manager(Approver)/Supervisors Name',
              'Account Access Required',
              'Accounts Needed'
            ]
          }
        ]
      },
      {
        pageNumber: 7,
        title: 'Access Details & Types of Access Control',
        content: `i. Same Permission As / Access Level Details
j. Access Removal or Modification
k. Removal/Modification Type:
l. Removal Reason or Modification Details:
m. Access Level
n. System/Application
o. Distribution Lists/Shared Folder Access Required
p. Email Groups
q. Folder Access
r. Preferred Area Code:

The HR team will create an onboarding base camp ticket for all the new joiners. It will comprise each team's activities like PM, Accounts, HR, and ITOPS.

Types of Access Control
Access control is classified into three types such as:
1. Role-Based Access Control (RBAC)
2. Discretionary Access Control (DAC)
3. Mandatory Access Control (MAC)

Role-Based Access Control (RBAC): Users can be assigned access to the ${companyName} system, files on a one-by-one basis whereby access is granted to the user for a particular file or system. It can simplify the assignment of privileges necessary to perform their duties. It also means that when an employee is assigned a new role in ${companyName} technologies the individual's access shall be updated to reflect the role change without explicit approval by respective managers.

Discretionary Access Control (DAC): It permits the user, who is granted access to information, to decide how to protect the information and the level of sharing desired. Access to files is restricted to users and groups based upon their identity and the groups to which the users belong.

Mandatory Access Control (MAC): It does not permit the end user to decide who can access the information. It does not permit the user to pass privileges to other users as the access could then be circumvented.

Following are the two frequent principles directing the access control policy:
4. Need-to-know: you are only granted access to the information you need to perform your tasks (different tasks/roles mean different need-to-know and hence different access profile)
5. Need-to-use: you are only granted access to the information processing facilities (IT equipment, applications, procedures, rooms) you need to perform your task/job/role.`,
        sections: [
          {
            letteredItems: [
              'Same Permission As / Access Level Details',
              'Access Removal or Modification',
              'Removal/Modification Type:',
              'Removal Reason or Modification Details:',
              'Access Level',
              'System/Application',
              'Distribution Lists/Shared Folder Access Required',
              'Email Groups',
              'Folder Access',
              'Preferred Area Code:'
            ]
          },
          {
            body: `The HR team will create an onboarding base camp ticket for all the new joiners. It will comprise each team's activities like PM, Accounts, HR, and ITOPS.`
          },
          {
            heading: 'Types of Access Control',
            body: `Access control is classified into three types such as:
1. Role-Based Access Control (RBAC)
2. Discretionary Access Control (DAC)
3. Mandatory Access Control (MAC)

Role-Based Access Control (RBAC): Users can be assigned access to the ${companyName} system, files on a one-by-one basis whereby access is granted to the user for a particular file or system. It can simplify the assignment of privileges necessary to perform their duties. It also means that when an employee is assigned a new role in ${companyName} technologies the individual's access shall be updated to reflect the role change without explicit approval by respective managers.

Discretionary Access Control (DAC): It permits the user, who is granted access to information, to decide how to protect the information and the level of sharing desired. Access to files is restricted to users and groups based upon their identity and the groups to which the users belong.

Mandatory Access Control (MAC): It does not permit the end user to decide who can access the information. It does not permit the user to pass privileges to other users as the access could then be circumvented.

Following are the two frequent principles directing the access control policy:
4. Need-to-know: you are only granted access to the information you need to perform your tasks (different tasks/roles mean different need-to-know and hence different access profile)
5. Need-to-use: you are only granted access to the information processing facilities (IT equipment, applications, procedures, rooms) you need to perform your task/job/role.`
          }
        ]
      },
      {
        pageNumber: 8,
        title: 'Access Control Rules, Networks & Third Parties',
        content: `${companyName} applies a need-to-know principle on access management. The need-to-know principle means that each and every individual working for ${companyName}, either employee or external service provider, shall have access only to such information that is necessary to perform the individual's duties.

${companyName} also applies a need to use principle, which means that each individual working for ${companyName} shall only have access to the equipment, facilities and applications necessary to perform the individual's duties. It also means that each individual working for ${companyName} shall only be granted such permissions to information (read, write, modify, admin) as is necessary to perform the individual's duties.

Access Control Rules
Following should be considered when specifying access control rules:
▪ establishing rules based on the premise "Everything is generally forbidden unless expressly permitted" rather than the weaker rule "Everything is generally permitted unless expressly forbidden".
▪ changes in information labels that are initiated automatically by information processing facilities and those initiated at the discretion of a user
▪ changes in user permissions that are initiated automatically by the information system and those initiated by an administrator

Access to networks and network services
Following should be considered while creating an access control policy concerning the use of access to networks and network services such as:
▪ user authentication requirements for accessing various network services
▪ monitoring of the use of network services
▪ what networks and network services are allowed to be accessed
▪ authorization procedures for determining - who is allowed to access which networks and networked services
▪ management controls and procedures to protect access to network connections and network services
▪ by what means access networks and network services like VPN or wireless network is used

Access rights to third parties
Access given to third parties for ${companyName} information processing facilities is restricted and governed by the principle of 'least privilege' and 'need-to-know basis. ${companyName} employees coordinating with the respective third-party consultants, engineers, vendor's representatives etc. are responsible for justifying the access rights granted to third parties.`
      },
      {
        pageNumber: 9,
        title: 'Third-Party Access & User Account Management',
        content: `The third party representatives will be primarily restricted to use the ${companyName} information resources from within the company's network. However, if under any circumstances remote access to the network has to be given to third parties, then it shall be either a dedicated channel of communication or a secured VPN tunnel for the desired limited duration.

All access granted to third parties would be revoked once the required assignment/task is over.

User Account Management
▪ Recognize the account type such as individual, group, system, application, guest, and temporary usage.
▪ Establish conditions for group membership.
▪ Identify authorized users of the information asset and specify access privileges.
▪ Require appropriate approvals for requests to establish accounts.
▪ Establish, activate, modify, disable, and remove accounts.
▪ In particular, authorize and monitor the utilization of guest and temporary accounts.
▪ Notify respective account managers when temporary accounts are no longer required and when information asset users are terminating or transferred, or information assets usage or need-to-know changes.
▪ Deactivate temporary accounts that aren't any longer needed and accounts of terminated or transferred users.
▪ Review accounts on a periodic basis or at least annually.
▪ Grant access to the system based on
  – valid access authorization
  – intended system usage, and
  – other attributes as required by ${companyName} or associated business functions.

User registration and de-registration
The process for managing user IDs should include the following:
▪ immediately disabling or removing user IDs of users who have left the organization
▪ periodically identifying and removing or disabling redundant user IDs
▪ using unique user IDs to enable users to be linked to and held responsible for their actions, the use of shared IDs should only be permitted where they are necessary for business or operational reasons and should be approved and documented
▪ ensuring that redundant user IDs are not issued to other users.

A two step procedure is followed for providing or revoking access to information or information processing facilities:`
      },
      {
        pageNumber: 10,
        title: 'Provisioning & Privileged Access Rights',
        content: `6. assigning and enabling, or revoking, a user ID
7. providing, or revoking, access rights to such user ID

User access provisioning
Following are the provisioning process to assign or revoke access rights granted to user IDs:
▪ obtaining authorization from the owner of the information system or service for the use of the information system or service; separate approval for access rights from management may also be appropriate
▪ verifying that the level of access granted is appropriate to the access policies and is consistent with other requirements such as segregation of duties
▪ ensuring that access rights are not activated (by service providers) before authorization procedures are completed
▪ maintaining a central record of access rights granted to a user ID to access information systems and services
▪ adapting access rights of users who have changed roles or jobs and immediately removing or blocking access rights of users who have left the organization
▪ periodically reviewing access rights with owners of the information systems or services

Management of privileged access rights
A formal authorization process relevant to access control policy can control the allocation of privileged access rights. The following steps should be considered:
▪ the privileged access rights associated with each system or process such as operating system, database management system and each application and the users to whom they need to be allocated should be identified
▪ requirements for expiry of privileged access rights should be defined
▪ privileged access rights should be assigned to a user ID different from those used for regular business activities. Regular business activities should not be performed from privileged ID
▪ privileged access rights should be allocated to users on a need-to-use basis and on an event-by-event basis in line with the access control policy, that is based on the minimum requirement for their functional roles
▪ an authorization process and a record of all privileges allocated should be maintained. Privileged access rights should not be granted until the authorization process is complete
▪ the competencies of users with privileged access rights should be reviewed regularly in order to verify if they are in line with their duties
▪ specific procedures should be established and maintained in order to avoid the unauthorized use of generic administration user IDs, according to systems configuration capabilities`
      },
      {
        pageNumber: 11,
        title: 'Reviews, Removal of Rights & Secret Authentication',
        content: `▪ For generic administration user IDs, the confidentiality of secret authentication information should be maintained when shared in situations like changing passwords frequently and as soon as possible when a privileged user leaves or changes job, communicating them among privileged users with appropriate mechanisms.

Review of user access rights
Following should be considered while reviewing the access rights:
▪ users access rights should be reviewed at regular intervals and after any changes, such as promotion, demotion or termination of employment
▪ user access rights should be reviewed and re-allocated when moving from one role to another within the same organization
▪ authorizations for privileged access rights should be reviewed at more frequent intervals
▪ privilege allocations should be checked at regular intervals to ensure that unauthorized privileges have not been obtained
▪ changes to privileged accounts should be logged for periodic review.

Removal of access rights
Access rights for information and assets associated with ${companyName} technologies information processing facilities should be reduced or removed before the employment terminates or changes, depending on the evaluation of risk factors such as:
▪ whether the termination or change is initiated by the employee, the external party user or by management, and the reason for termination
▪ the current responsibilities of the employee, external party user or any other user
▪ the value of the assets currently accessible

Immediately when an individual is subject to a change in duties or responsibilities, any access that is no longer necessary to perform the individual's duties shall be removed. Such changes in duties or responsibilities may be temporary or permanent. Special care shall be taken to remove any temporary access granted as soon as the temporary need for access expires.

Use of secret authentication information
${companyName} users should be required to follow the organization's practices in the use of secret authentication information.
All ${companyName} users are advised to:
▪ keep secret authentication information confidential, ensuring that it is not divulged to any other parties, including people of authority`
      },
      {
        pageNumber: 12,
        title: 'Authentication Rules, Access & Info Flow Enforcement',
        content: `▪ avoid keeping a record on paper, software file or hand-held device of secret authentication information, unless this can be stored securely and the method of storing has been approved by using password vault
▪ change secret authentication information whenever there is any indication of its possible compromise
▪ when passwords are used as secret authentication information, select quality passwords with sufficient minimum length defined in password policy which are:
  – easy to remember
  – not based on anything somebody else could easily guess or obtain using person related
  – not vulnerable to dictionary attacks
  – free of consecutive identical, all-numeric or all-alphabetic characters
▪ not share individual user's secret authentication information
▪ ensure proper protection of passwords when passwords are used as secret authentication
▪ information in automated log-on procedures and are stored
▪ not use the same secret authentication information for business and non-business purposes.

Access Enforcement
Access control lists, access control matrices, Implementation cryptography Mechanisms
Object in the Devices, files, records, processes, programs, Information System domains.

Above all are utilized by organizations to manage access between users or processes acting on behalf of users in the information system.

Besides implementing agreed access at the information-system stage, access enforcement mechanisms are employed at the application level, when required, to supply improved information security for the organization. Consideration is given to the implementation of an audited, explicit override of automated mechanisms in the event of emergencies or other serious events. If encryption of stored data is employed as an access enforcement mechanism, the cryptography used ought to be in line with the encryption policy of the ${companyName} technologies.

Information Flow Enforcement
${companyName} technologies information flow control regulates wherever information is permitted to go inside an information system and between data systems (as opposed to who is allowed to access the information) and without explicit regard to subsequent accesses to that information.

Information flow control policies and enforcement mechanisms are commonly employed by organizations to control the flow of information between designated sources and destinations like networks, individuals, devices within information systems and between interconnected systems.`
      },
      {
        pageNumber: 13,
        title: 'Flow Control, Segregation of Duties & Application Access',
        content: `Below are examples of flow control restrictions such as:
▪ keeping export-controlled information from being transmitted in the clear to the Internet
▪ blocking outside traffic that claims to be from within the organization and not transmitting any web requests to the Internet that aren't from the internal web proxy.

Separation of Duties
Separates duties of individuals as required to avoid unauthorized activity without knowledge. Separation of duties is implemented through assigned information system access authorizations and are documented.

Below are the examples of separation of duties such as:
▪ Different administrator accounts should be used for different roles.
▪ Mission functions and distinct information system support functions are divided among different individuals/roles.
▪ Different types of individuals act upon information system support functions like system management, systems programming, configuration management, quality assurance and testing, network security.
▪ Security personnel who administer access control functions do not administer audit functions.

Least Privilege
All ${companyName} Business Systems must utilize the notion of least privilege, allowing only approved accesses for users who are needed to accomplish assigned tasks with organizational business functions.

System Usage Notification
Display a permitted system use notification message or poster before granting access to the system that gives privacy and security notices reliable with rules, standards, and policies.

Retain the notification message or banner on the screen until users take explicit actions to log on to or further access the information asset.

System and application access control
System and application access control prevents from unauthorized access.
Restrictions to access should be based on individual business application requirements and in accordance with the defined access control policy.

The following should be considered in order to support access restriction requirements:
▪ providing control access to application system functions
▪ controlling the access rights of users such as read, write, delete and execute`
      },
      {
        pageNumber: 14,
        title: 'Secure Log-on Procedures & Privileged Utilities',
        content: `▪ controlling the access rights of other applications
▪ limiting the information contained in outputs
▪ controlling which data can be accessed by a particular user
▪ providing physical or logical access controls for the isolation of sensitive applications, application data, or systems

Secure log-on procedures
Where strong authentication and identity verification is required, authentication methods alternative to passwords, such as cryptographic means, smart cards, tokens or biometric means, should be used.

The procedure for logging into a system or application should be designed to minimize the opportunity for unauthorized access. The log-on procedure should therefore disclose the minimum of information about the system or application, in order to avoid providing an unauthorized user with any unnecessary assistance.

A good log-on procedure should:
▪ protect against brute force log-on attempts
▪ log unsuccessful and successful attempts
▪ not display system or application identifiers until the log-on process has been successfully completed
▪ terminate inactive sessions after a defined period of inactivity, especially in high risk locations such as public or external areas outside the organization's security management or on mobile devices
▪ display a general notice warning that system should only be accessed by authorized users
▪ not provide help messages during the log-on procedure that would aid an unauthorized user
▪ validate the log-on information only on completion of all input data. If an error condition arises, the system should not indicate which part of the data is correct or incorrect
▪ raise a security event if a potential attempted or successful breach of log-on controls is detected
▪ display the following information on completion of a successful log-on:
  – date and time of the previous successful log-on
  – details of any unsuccessful log-on attempts since the last successful log-on
▪ not display a password being entered
▪ not transmit passwords in clear text over a network
▪ restrict connection times to provide additional security for high-risk applications and reduce the window of opportunity for unauthorized access.

Use of privileged utility programs
The following guidelines for the use of utility programs that might be capable of overriding system and application controls should be considered:`
      },
      {
        pageNumber: 15,
        title: 'Privileged Utilities, Source Code Access & Validity',
        content: `▪ use of identification, authentication and authorization procedures for utility programs
▪ authorization for ad hoc use of utility programs
▪ limitation of the availability of utility programs for the duration of an authorized change
▪ logging of all use of utility programs
▪ defining and documenting of authorization levels for utility programs
▪ removal or disabling of all unnecessary utility programs
▪ segregation of utility programs from applications software
▪ limitation of the use of utility programs to the minimum practical number of trusted, authorized users
▪ not making utility programs available to users who have access to applications on systems where segregation of duties is required.

Access control to program source code
Access to program source code and associated items such as designs, specifications, verification plans and validation plans should be strictly controlled, in order to prevent the introduction of unauthorized functionality and to avoid unintentional changes as well as to maintain the confidentiality of valuable intellectual property. For program source code, this can be achieved by controlled central storage of such code, preferably in program source libraries.

Following guidelines are considered while accessing program source code to control access to such program source libraries in order to reduce the potential for corruption of computer programs:
▪ program listings should be held in a secure environment
▪ program source libraries should not be held in operational systems, if possible
▪ the program source code and the program source libraries should be managed according to established procedures
▪ support personnel should not have unrestricted access to program source libraries
▪ the updating of program source libraries and associated items and the issuing of program sources to programmers should be performed only after receiving appropriate authorization
▪ an audit log should be maintained for all accesses to program source libraries
▪ maintenance and copying of program source libraries should be subject to strict change control procedures

Validity and Document Management
This Policy document is effective from 25 July 2025. The owner of this document is the Chief Information Security Officer (CISO), who must review and, if necessary, update the document at least once a year.`
      },
      {
        pageNumber: 16,
        title: 'Enforcement & Distribution',
        content: `Enforcement
Any employee who is found to have breached this policy may be subject to disciplinary action. Any violation of the Procedure by a permanent/temporary worker, contractor, or supplier may result in the termination of their contract or assignment.

Distribution
Table:
Name: All employees | Title: NA

End of Document`,
        sections: [
          {
            heading: 'Enforcement',
            body: `Any employee who is found to have breached this policy may be subject to disciplinary action. Any violation of the Procedure by a permanent/temporary worker, contractor, or supplier may result in the termination of their contract or assignment.`
          },
          {
            heading: 'Distribution',
            table: {
              headers: ['Name', 'Title'],
              rows: [['All employees', 'NA']]
            }
          }
        ]
      }
    ],
    content: `# ${companyName} - Access Control Policy
**Standard:** ${framework} | **Document No.:** ARP_ISMS_P11 | **Classification:** Private (Internal) | **Version:** 1.0

## Document Control
This document is the sole property of ${companyName} and shall not be reproduced or photocopied, in part or in whole, without the approval of the Chief Information Security Officer (CISO).

## Purpose & Scope
The purpose of this policy is to define rules for access to various systems, equipment, facilities and information, based on business and security requirements for access in ${companyName} Technologies Private Limited.

## Core Rules & Enforcement
- RBAC, DAC, and MAC frameworks enforced across all IT and cloud assets.
- Need-to-know and Need-to-use principles applied universally.
- Strict privileged account segregation and mandatory multi-factor authentication.`
  };

  // 2. ASSET HANDLING PROCEDURE (ARP_ISMS_PR07) - 10 Pages exact match
  const assetHandlingProcedure: GeneratedDocument = {
    id: 'doc_pro_asset_handling',
    docCode: 'ARP_ISMS_PR07',
    title: 'Asset Handling Procedure',
    type: 'PROCEDURE',
    category: 'Asset Management',
    version: '1.0',
    status: 'APPROVED',
    owner: 'Chief Information Security Officer (CISO)',
    approver: 'Chief Information Security Officer (CISO)',
    effectiveDate: '05 June 2024',
    reviewCycle: 'Annual',
    classification: 'Private (Internal)',
    standard: framework,
    documentOwner: 'Chief Information Security Officer (CISO)',
    issuedBy: 'TL / Manager',
    approvedBy: 'Chief Information Security Officer (CISO)',
    acknowledgementCount: 18,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: 'Introduction', pageNo: 5, level: 1 },
      { title: 'Asset Handling Procedure', pageNo: 6, level: 1 },
      { title: 'Level 0 -- Public (or Unclassified)', pageNo: 6, level: 2 },
      { title: 'Secure Processing', pageNo: 6, level: 3 },
      { title: 'Storage', pageNo: 6, level: 3 },
      { title: 'Transmission', pageNo: 6, level: 3 },
      { title: 'Declassification', pageNo: 6, level: 3 },
      { title: 'Destruction', pageNo: 6, level: 3 },
      { title: 'Chain of Custody', pageNo: 6, level: 3 },
      { title: 'Logging of Security-related Events', pageNo: 6, level: 3 },
      { title: 'Level 1 - Internal', pageNo: 7, level: 2 },
      { title: 'Secure Processing', pageNo: 7, level: 3 },
      { title: 'Storage', pageNo: 7, level: 3 },
      { title: 'Transmission', pageNo: 7, level: 3 },
      { title: 'Declassification', pageNo: 7, level: 3 },
      { title: 'Destruction', pageNo: 7, level: 3 },
      { title: 'Chain of Custody', pageNo: 7, level: 3 },
      { title: 'Logging of Security-related Events', pageNo: 7, level: 3 },
      { title: 'Level 2 - Restricted', pageNo: 7, level: 2 },
      { title: 'Secure Processing', pageNo: 7, level: 3 },
      { title: 'Storage', pageNo: 8, level: 3 },
      { title: 'Transmission', pageNo: 8, level: 3 },
      { title: 'Declassification', pageNo: 8, level: 3 },
      { title: 'Destruction', pageNo: 8, level: 3 },
      { title: 'Chain of Custody', pageNo: 8, level: 3 },
      { title: 'Logging of Security-related Events', pageNo: 8, level: 3 },
      { title: 'Level 3 - Confidential', pageNo: 8, level: 2 },
      { title: 'Secure Processing', pageNo: 8, level: 3 },
      { title: 'Storage', pageNo: 9, level: 3 },
      { title: 'Transmission', pageNo: 9, level: 3 },
      { title: 'Declassification', pageNo: 9, level: 3 },
      { title: 'Destruction', pageNo: 9, level: 3 },
      { title: 'Chain of Custody', pageNo: 9, level: 3 },
      { title: 'Logging of Security-related Events', pageNo: 9, level: 3 },
      { title: 'Conclusion', pageNo: 9, level: 1 },
      { title: 'Validity and Document Management', pageNo: 10, level: 1 },
      { title: 'Enforcement', pageNo: 10, level: 1 },
      { title: 'Distribution', pageNo: 10, level: 1 }
    ],
    pages: [
      {
        pageNumber: 5,
        title: 'Introduction & Relevant Policies',
        content: `Introduction
The purpose of this document is to set out the specific controls that must be used when handling information of a particular classification. For details of the criteria for classifying information assets, please see the Information Classification Procedure.

Classified information must not be disclosed to any other person or organization via any insecure method including, but not limited, to the following:
▪ Paper based methods
▪ Fax
▪ Telephone
▪ Email
▪ Verbally

Where information is disclosed/shared with third parties it should only be done so in accordance with a documented information sharing protocol and/or data exchange agreement.

Disclosure of classified information to unauthorized persons will result in disciplinary action. If there is suspicion that such information has been communicated in a way that could be harmful to the organization or to the data subject, then it has to be reported in accordance with the organization's information security incident management procedures.

Any sharing or transfer of classified information with other organizations must comply with all legal, regulatory and organization policy requirements.

This control applies to all systems, people and processes that constitute the organization's information systems, including board members, directors, employees, suppliers and other third parties who have access to ${companyName} systems.

The following policies and procedures are relevant to this document:
▪ Information Asset Inventory
▪ Data Classification Procedure
▪ Information Labelling Procedure
▪ Network Security Policy
▪ Cryptographic Policy
▪ Incident Response Procedure
▪ Physical Security Policy`,
        sections: [
          {
            heading: 'Introduction',
            body: `The purpose of this document is to set out the specific controls that must be used when handling information of a particular classification. For details of the criteria for classifying information assets, please see the Information Classification Procedure.`
          },
          {
            heading: 'Classified information must not be disclosed to any other person or organization via any insecure method including, but not limited, to the following:',
            bullets: ['Paper based methods', 'Fax', 'Telephone', 'Email', 'Verbally']
          },
          {
            heading: 'The following policies and procedures are relevant to this document:',
            bullets: [
              'Information Asset Inventory',
              'Data Classification Procedure',
              'Information Labelling Procedure',
              'Network Security Policy',
              'Cryptographic Policy',
              'Incident Response Procedure',
              'Physical Security Policy'
            ]
          }
        ]
      },
      {
        pageNumber: 6,
        title: 'Asset Handling: Level 0 - Public (or Unclassified)',
        content: `Asset Handling Procedure
For each security classification level a set of handling controls must be in place to ensure that the information asset involved is appropriately protected at all times.

The following sections set out the main procedural components of these controls.

Level 0 -- Public (or Unclassified)
This classification describes information which is in the public domain or is freely published by the organization.

Secure Processing
In general there are no specific controls that need to be placed on processing of such information. However it should be borne in mind that items such as headed stationery and their electronic equivalents should not be made freely available.

Storage
Level 0 information may be stored in unsecured areas accessible to the public. However some controls should be placed on large quantities of such information such as leaflets which could still be subject to theft or misuse.
Information of this classification may be stored on electronic media such as backup tapes, DVDs and CDs without encryption or other forms of protection.

Transmission
In general, Level 0 information may be sent in unencrypted connections or distributed freely in hard copy.

Declassification
Level 0 information will not be subject to declassification as it is already at the lowest level.

Destruction
Information falling within the Level 0 classification may be disposed of via normal waste routes without need for controls such as shredding. Where possible, items should be recycled.

Chain of Custody
Level 0 information assets will be freely distributed amongst organization employees, customers and members of the public where required, without the need to keep records (unless for operational purposes).

Logging of Security-related Events
There is generally no need to log security incidents relating to Level 0 classification items unless subject to criminal activity such as large-scale theft of material.`
      },
      {
        pageNumber: 7,
        title: 'Asset Handling: Level 1 - Internal & Level 2 - Restricted',
        content: `Level 1 - Internal
Level 1 is the lowest level of classification to which protection is applied.

Secure Processing
Information at this level of classification will be subject to access controls involving either physical security or an authorized use logon or both. Access should not generally be granted in public areas and output such as printouts should be to areas where public access is prevented.

Storage
Information of this classification may be stored on electronic media such as backup tapes, DVDs and CDs. These media should be subject to secure storage such as in a locked room in an area where there is no public access.

Transmission
In general, Level 1 information may be sent in the clear over unencrypted connections in small quantities, such as when dealing with an individual customer. However the use of file encryption is strongly recommended for items such as email attachments particularly where they contain significant quantities of Level 1 data.

Declassification
Level 1 information may be declassified to "Public" with the permission of the asset owner at which time the controls specified in section 2.1 above will apply.

Destruction
Level 1 information should be destroyed securely so that it cannot be reconstituted e.g. via shredding for paper or full deletion for electronic files.

Chain of Custody
No specific controls are placed on the chain of custody for Level 1 information although reasonable precautions should be taken to ensure that it stays within the organization at all times.

Logging of Security-related Events
Incidents where Level 1 information has been compromised should be recorded and investigated in accordance with the organization's security incident management procedures.

Level 2 - Restricted
Level 2 is the second level of classification to which protection is applied.

Secure Processing`
      },
      {
        pageNumber: 8,
        title: 'Asset Handling: Level 2 - Restricted & Level 3 - Confidential',
        content: `Information at this level of classification will be subject to strict access controls involving both physical security and authorized use logon. Access will not be granted in public areas and output such as printouts must be to areas where public and unauthorized employee access is prevented.

Storage
Information of this classification may be stored on electronic media such as backup tapes, DVDs and CDs. These media must be subject to secure storage such as in a locked room in an area where there is no access to unauthorized personnel. Procedures must be in place for the management of keys to such areas.

Transmission
Restricted information may not be sent in unencrypted connections and the use of file encryption is mandatory for items such as email attachments.

Declassification
Restricted information may be declassified to "Internal" or "Public" with the permission of the asset owner at which time the controls specified in the relevant section above will apply.

Destruction
Level 2 information must be destroyed securely so that it cannot be reconstituted e.g. via shredding for paper or full deletion for electronic files. Where possible, secure destruction should be verified by a second authorized individual.

Chain of Custody
The chain of custody for Level 2 information should be clearly defined and tracked via formal handovers including signatures for acceptance.

Logging of Security-related Events
Incidents where Level 2 information has been compromised should be reported immediately and flagged as a major incident. Such incidents will be recorded and investigated in accordance with the organization's security incident management procedures.

Level 3 - Confidential
Level 3 is the highest level of classification to which protection is applied.

Secure Processing
Information at this level of classification will be subject to very strict access controls involving both physical security and authorized use logon with additional security measures in place. Access will not be granted in public areas and output such as printouts must be to areas where only those organization staff who are authorized to the information asset can reach it.`
      },
      {
        pageNumber: 9,
        title: 'Level 3 - Confidential & Conclusion',
        content: `Storage
Information of this classification must not be stored on removable electronic media such as DVDs and CDs. Backups may be taken as long as this provides no more access than when the information is within the computer system. Backup media must be subject to secure storage such as in a locked room in an area where there is no access to unauthorized personnel. Procedures must be in place for the management of keys to such areas. Additional controls such as encryption must be used where it is practical. Hardcopy information must not be removed from its home office unless with the express approval of the information asset owner.

Transmission
Level 3 information must not be sent in unencrypted connections and the use of file encryption is mandatory for items such as email attachments (although the use of email is to be discouraged).

Declassification
Confidential information may be declassified to "Restricted", "Internal" or "Public" with the permission of the asset owner at which time the controls specified in the relevant section above will apply.

Destruction
Level 3 information must be destroyed securely so that it cannot be reconstituted e.g. via shredding for paper or full deletion for electronic files. Where possible, secure destruction should be verified by a second authorized individual.

Chain of Custody
The chain of custody for Level 3 information should be clearly defined and tracked via formal handovers including signatures for acceptance. Where possible, copies of the information should be numbered and its possession tracked at all times.

Logging of Security-related Events
Incidents where Level 3 information has been compromised should be reported to senior management immediately and flagged as a major incident. Such incidents will be recorded and investigated in accordance with the organization's security incident management procedures.

Conclusion
It is important that this procedure is followed in all cases so that the organization's assets are adequately protected in line with the appropriate classification.
The controls described in this procedure must be followed throughout the lifecycle of information assets, including where they are transferred to third parties. Proper handling of assets is fundamental to the correct operation of the ISMS and without it many of the other controls that are in place will not be effective.`
      },
      {
        pageNumber: 10,
        title: 'Validity, Enforcement & Distribution',
        content: `All employees and third parties who will come into contact with the organization's information assets must be aware of this procedure and necessary arrangements it specifies.

Validity and Document Management
This Procedure document is effective from 05 June 2024. The owner of this document is the Chief Information Security Officer (CISO), who must review and, if necessary, update the document at least once a year.

Enforcement
Any ${companyName} employee who is found to have breached this policy may be subject to disciplinary action. Any violation of the policy by a permanent/temporary worker, contractor, or supplier may result in the termination of their contract or assignment.

Distribution
Table:
Name: All employees | Title: NA

End of Document`,
        sections: [
          {
            heading: 'Validity and Document Management',
            body: `This Procedure document is effective from 05 June 2024. The owner of this document is the Chief Information Security Officer (CISO), who must review and, if necessary, update the document at least once a year.`
          },
          {
            heading: 'Enforcement',
            body: `Any ${companyName} employee who is found to have breached this policy may be subject to disciplinary action. Any violation of the policy by a permanent/temporary worker, contractor, or supplier may result in the termination of their contract or assignment.`
          },
          {
            heading: 'Distribution',
            table: {
              headers: ['Name', 'Title'],
              rows: [['All employees', 'NA']]
            }
          }
        ]
      }
    ],
    content: `# ${companyName} - Asset Handling Procedure
**Standard:** ${framework} | **Document No.:** ARP_ISMS_PR07 | **Classification:** Private (Internal) | **Version:** 1.0

## Document Control
This document is the sole property of ${companyName} and shall not be reproduced or photocopied, in part or in whole, without the approval of the Chief Information Security Officer (CISO).

## Asset Handling Controls by Level
- **Level 0 (Public):** General unencrypted transmission, standard recycling.
- **Level 1 (Internal):** Logon access required, encrypted attachments recommended.
- **Level 2 (Restricted):** Mandatory encryption in transit and storage, shredding/witnessed deletion.
- **Level 3 (Confidential):** Strict physical and logical locks, numbered copies, instant senior management escalation.`
  };

  // 3. INFORMATION SECURITY POLICY (ARP_ISMS_P01)
  const infoSecPolicy: GeneratedDocument = {
    id: 'doc_pol_infosec_master',
    docCode: 'ARP_ISMS_P01',
    title: 'Information Security Policy',
    type: 'POLICY',
    category: 'Organizational Governance',
    version: '1.0',
    status: 'APPROVED',
    owner: 'Chief Information Security Officer (CISO)',
    approver: 'Chief Information Security Officer (CISO)',
    effectiveDate: '15 January 2025',
    reviewCycle: 'Annual',
    classification: 'Private (Internal)',
    standard: framework,
    documentOwner: 'Chief Information Security Officer (CISO)',
    issuedBy: 'TL / Manager',
    approvedBy: 'Chief Information Security Officer (CISO)',
    acknowledgementCount: 22,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: 'Purpose', pageNo: 4, level: 1 },
      { title: 'Information Security Objectives (CIA)', pageNo: 4, level: 1 },
      { title: 'Management Commitment & Scope', pageNo: 5, level: 1 },
      { title: 'Core Governance Principles', pageNo: 5, level: 1 },
      { title: 'Validity and Document Management', pageNo: 6, level: 1 },
      { title: 'Enforcement & Distribution', pageNo: 6, level: 1 }
    ],
    pages: [
      {
        pageNumber: 4,
        title: 'Purpose & Objectives',
        content: `Purpose
This policy defines the executive management direction and commitment of ${companyName} towards establishing, implementing, operating, monitoring, reviewing, maintaining, and continually improving an Information Security Management System (ISMS) in alignment with ${framework}.

Information Security Objectives (CIA)
${companyName} is committed to preserving:
▪ Confidentiality: Protecting proprietary software source code, customer personal data, and financial transactions from unauthorized disclosure.
▪ Integrity: Ensuring accuracy, authenticity, and completeness of information assets and preventing unauthorized modification.
▪ Availability: Ensuring authorized users have uninterrupted access to critical business systems and cloud applications with 99.9% uptime SLA.`
      },
      {
        pageNumber: 5,
        title: 'Management Commitment & Core Principles',
        content: `Management Commitment & Scope
Top Management shall demonstrate leadership and commitment with respect to the ISMS by:
▪ Ensuring the information security policy and information security objectives are established and are compatible with the strategic direction of ${companyName}.
▪ Ensuring the integration of ISMS requirements into the organization's processes.
▪ Ensuring resources needed for the ISMS are available.

Core Governance Principles
▪ Risk Management: Continuous identification and treatment of information security risks.
▪ Compliance: Adherence to statutory, regulatory, and contractual obligations including MAS TRM, GDPR, and enterprise agreements.
▪ Awareness: Ongoing workforce security training and simulated phishing tests.`
      },
      {
        pageNumber: 6,
        title: 'Validity, Enforcement & Distribution',
        content: `Validity and Document Management
This Policy document is effective from 15 January 2025. The owner of this document is the Chief Information Security Officer (CISO), who must review and, if necessary, update the document at least once a year.

Enforcement
Any employee who is found to have breached this policy may be subject to disciplinary action. Any violation of the policy by a permanent/temporary worker, contractor, or supplier may result in the termination of their contract or assignment.

Distribution
Table:
Name: All employees | Title: NA

End of Document`,
        sections: [
          {
            heading: 'Validity and Document Management',
            body: `This Policy document is effective from 15 January 2025. The owner of this document is the Chief Information Security Officer (CISO), who must review and, if necessary, update the document at least once a year.`
          },
          {
            heading: 'Enforcement',
            body: `Any employee who is found to have breached this policy may be subject to disciplinary action. Any violation of the policy by a permanent/temporary worker, contractor, or supplier may result in the termination of their contract or assignment.`
          },
          {
            heading: 'Distribution',
            table: {
              headers: ['Name', 'Title'],
              rows: [['All employees', 'NA']]
            }
          }
        ]
      }
    ],
    content: `# ${companyName} - Information Security Policy
**Standard:** ${framework} | **Document No.:** ARP_ISMS_P01 | **Classification:** Private (Internal)

Top management commitment to the Confidentiality, Integrity, and Availability (CIA) triad across all infrastructure, codebases, and personnel.`
  };

  // 4. INCIDENT MANAGEMENT PROCEDURE (ARP_ISMS_PR02)
  const incidentProcedure: GeneratedDocument = {
    id: 'doc_pro_incident_management',
    docCode: 'ARP_ISMS_PR02',
    title: 'Incident Management Procedure',
    type: 'PROCEDURE',
    category: 'Security Operations',
    version: '1.0',
    status: 'APPROVED',
    owner: 'Chief Information Security Officer (CISO)',
    approver: 'Chief Information Security Officer (CISO)',
    effectiveDate: '10 March 2025',
    reviewCycle: 'Annual',
    classification: 'Private (Internal)',
    standard: framework,
    documentOwner: 'Chief Information Security Officer (CISO)',
    issuedBy: 'TL / Manager',
    approvedBy: 'Chief Information Security Officer (CISO)',
    acknowledgementCount: 16,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: 'Introduction & Severity Classification', pageNo: 4, level: 1 },
      { title: 'Incident Response Lifecycle Steps', pageNo: 5, level: 1 },
      { title: 'Regulatory Reporting SLAs (1-Hour & 72-Hour)', pageNo: 6, level: 1 },
      { title: 'Post-Incident Review & CAPA', pageNo: 7, level: 1 },
      { title: 'Validity, Enforcement & Distribution', pageNo: 8, level: 1 }
    ],
    pages: [
      {
        pageNumber: 4,
        title: 'Introduction & Severity Matrix',
        content: `Introduction
This procedure defines the end-to-end process for detecting, triaging, containing, eradicating, and recovering from information security incidents impacting ${companyName}.

Severity Classification Matrix:
▪ Critical (P1): Severe outage of critical customer-facing SaaS systems, verified exfiltration of customer PII, or ransomware outbreak.
▪ High (P2): Compromise of production server or administrative credential without active data exfiltration.
▪ Medium (P3): Malware on isolated developer endpoint with automated EDR containment.
▪ Low (P4): Phishing email reported with zero clicks.`
      },
      {
        pageNumber: 5,
        title: 'Incident Response Lifecycle Steps',
        content: `Incident Response Lifecycle:
1. Detection & Identification: Ingestion from SIEM, AWS GuardDuty alerts, GitHub secret scanning, or employee reports.
2. Triage & Containment: Isolate virtual machines, revoke compromised IAM tokens, terminate active sessions.
3. Eradication & Remediation: Remove malicious binaries, patch exploited vulnerabilities, rotate secrets.
4. Recovery & Verification: Restore verified database snapshots, monitor telemetry for anomalous persistence.`
      },
      {
        pageNumber: 6,
        title: 'Regulatory Reporting SLAs (1-Hour & 72-Hour)',
        content: `Mandatory Incident Reporting SLAs:
▪ MAS TRM Notice: Financial institutions must report any critical system disruption or severe security breach to MAS within 1 Hour of discovery.
▪ GDPR / PDPA Notice: Report personal data breaches to regulatory authorities within 72 Hours where feasible.
▪ Customer Notification: Notify impacted enterprise customers within contractually agreed SLAs (maximum 24 hours).`
      },
      {
        pageNumber: 7,
        title: 'Post-Incident Review & Root Cause Analysis',
        content: `Post-Incident Analysis (PIR):
▪ A formal Post-Incident Review meeting must be convened within 5 business days of incident closure.
▪ Root Cause Analysis (RCA) must be documented using 5-Whys methodology.
▪ Corrective and Preventive Actions (CAPA) must be logged in the GRC portal with assigned owners and target deadlines.`
      },
      {
        pageNumber: 8,
        title: 'Validity, Enforcement & Distribution',
        content: `Validity and Document Management
This Procedure document is effective from 10 March 2025. The owner of this document is the Chief Information Security Officer (CISO), who must review and, if necessary, update the document at least once a year.

Enforcement
Any employee who is found to have breached this policy may be subject to disciplinary action. Any violation of the policy by a permanent/temporary worker, contractor, or supplier may result in the termination of their contract or assignment.

Distribution
Table:
Name: All employees | Title: NA

End of Document`,
        sections: [
          {
            heading: 'Validity and Document Management',
            body: `This Procedure document is effective from 10 March 2025. The owner of this document is the Chief Information Security Officer (CISO), who must review and, if necessary, update the document at least once a year.`
          },
          {
            heading: 'Enforcement',
            body: `Any employee who is found to have breached this policy may be subject to disciplinary action. Any violation of the policy by a permanent/temporary worker, contractor, or supplier may result in the termination of their contract or assignment.`
          },
          {
            heading: 'Distribution',
            table: {
              headers: ['Name', 'Title'],
              rows: [['All employees', 'NA']]
            }
          }
        ]
      }
    ],
    content: `# ${companyName} - Incident Management Procedure
**Standard:** ${framework} | **Document No.:** ARP_ISMS_PR02 | **Classification:** Private (Internal)

Standard operating procedure for CSIRT response, containment protocols, 1-hour MAS TRM regulatory breach notification, and CAPA resolution.`
  };

  // 5. CHANGE MANAGEMENT PROCEDURE (ARP_ISMS_PR03)
  const changeProcedure: GeneratedDocument = {
    id: 'doc_pro_change_management',
    docCode: 'ARP_ISMS_PR03',
    title: 'Change Management Procedure',
    type: 'PROCEDURE',
    category: 'DevOps & Infrastructure',
    version: '1.0',
    status: 'APPROVED',
    owner: 'Chief Information Security Officer (CISO)',
    approver: 'Chief Information Security Officer (CISO)',
    effectiveDate: '15 February 2025',
    reviewCycle: 'Annual',
    classification: 'Private (Internal)',
    standard: framework,
    documentOwner: 'Chief Information Security Officer (CISO)',
    issuedBy: 'TL / Manager',
    approvedBy: 'Chief Information Security Officer (CISO)',
    acknowledgementCount: 15,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: 'Purpose & Scope', pageNo: 4, level: 1 },
      { title: 'Change Advisory Board (CAB) & Roles', pageNo: 4, level: 1 },
      { title: 'Standard, Normal & Emergency Changes', pageNo: 5, level: 1 },
      { title: 'Rollback & Verification Protocols', pageNo: 6, level: 1 },
      { title: 'Validity, Enforcement & Distribution', pageNo: 7, level: 1 }
    ],
    pages: [
      {
        pageNumber: 4,
        title: 'Purpose & CAB Governance',
        content: `Purpose
To ensure all modifications to software codebases, cloud infrastructure, network architectures, and configuration baselines in ${companyName} are evaluated, tested, approved, and tracked to avoid security degradations and outages.

Change Advisory Board (CAB) Governance
▪ The CAB meets weekly to evaluate Normal Changes.
▪ Members include Lead DevOps Architect, Security Engineer, Product Lead, and QA Lead.`
      },
      {
        pageNumber: 5,
        title: 'Change Classification & Approval Gates',
        content: `Change Types:
▪ Standard Change: Pre-approved low-risk changes (e.g., standard container image patch) with automated CI/CD validation.
▪ Normal Change: Production deployments, database schema alterations, network firewall modifications. Requires CAB review and testing sign-off.
▪ Emergency Change: Critical hotfixes required to mitigate active P1 security vulnerabilities or restore failed services. Requires retroactive CAB sign-off within 24 hours.`
      },
      {
        pageNumber: 6,
        title: 'Rollback & Production Deployment Safeguards',
        content: `Mandatory Deployment Controls:
▪ Automated branch protection requiring minimum 2 peer review approvals.
▪ Mandatory rollback plan and automated health probe checks.
▪ Zero direct SSH or interactive write access to production database clusters.`
      },
      {
        pageNumber: 7,
        title: 'Validity, Enforcement & Distribution',
        content: `Validity and Document Management
This Procedure document is effective from 15 February 2025. The owner of this document is the Chief Information Security Officer (CISO), who must review and, if necessary, update the document at least once a year.

Enforcement
Any employee who is found to have breached this policy may be subject to disciplinary action. Any violation of the policy by a permanent/temporary worker, contractor, or supplier may result in the termination of their contract or assignment.

Distribution
Table:
Name: All employees | Title: NA

End of Document`,
        sections: [
          {
            heading: 'Validity and Document Management',
            body: `This Procedure document is effective from 15 February 2025. The owner of this document is the Chief Information Security Officer (CISO), who must review and, if necessary, update the document at least once a year.`
          },
          {
            heading: 'Enforcement',
            body: `Any employee who is found to have breached this policy may be subject to disciplinary action. Any violation of the policy by a permanent/temporary worker, contractor, or supplier may result in the termination of their contract or assignment.`
          },
          {
            heading: 'Distribution',
            table: {
              headers: ['Name', 'Title'],
              rows: [['All employees', 'NA']]
            }
          }
        ]
      }
    ],
    content: `# ${companyName} - Change Management Procedure
**Standard:** ${framework} | **Document No.:** ARP_ISMS_PR03 | **Classification:** Private (Internal)

Rigorous standard operating procedure for RFC approvals, automated test gates, CAB authorization, and rollback assurance.`
  };

  // 6. CRYPTOGRAPHIC & KEY MANAGEMENT POLICY (ARP_ISMS_P02)
  const cryptoPolicy: GeneratedDocument = {
    id: 'doc_pol_cryptography',
    docCode: 'ARP_ISMS_P02',
    title: 'Cryptographic & Key Management Policy',
    type: 'POLICY',
    category: 'Security Architecture',
    version: '1.0',
    status: 'APPROVED',
    owner: 'Chief Information Security Officer (CISO)',
    approver: 'Chief Information Security Officer (CISO)',
    effectiveDate: '12 January 2025',
    reviewCycle: 'Annual',
    classification: 'Private (Internal)',
    standard: framework,
    documentOwner: 'Chief Information Security Officer (CISO)',
    issuedBy: 'TL / Manager',
    approvedBy: 'Chief Information Security Officer (CISO)',
    acknowledgementCount: 13,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: 'Encryption in Transit & At Rest', pageNo: 4, level: 1 },
      { title: 'Approved Algorithms & Key Lengths', pageNo: 5, level: 1 },
      { title: 'KMS Key Lifecycle & Rotation', pageNo: 6, level: 1 },
      { title: 'Validity, Enforcement & Distribution', pageNo: 7, level: 1 }
    ],
    pages: [
      {
        pageNumber: 4,
        title: 'Encryption in Transit & At Rest Standards',
        content: `Encryption Mandates
▪ In Transit: TLS 1.3 or TLS 1.2 minimum with Perfect Forward Secrecy (PFS). Deprecated protocols (SSLv3, TLS 1.0, TLS 1.1) are strictly blocked.
▪ At Rest: AES-256 or ChaCha20-Poly1305 applied across all databases, persistent volumes, S3 buckets, and backup snapshots.`
      },
      {
        pageNumber: 5,
        title: 'Approved Algorithms & Key Lengths',
        content: `Approved Cryptographic Standards:
▪ Symmetric: AES-GCM (256-bit).
▪ Asymmetric: RSA >= 3072-bit, ECC (Curve25519 or NIST P-384).
▪ Hashing: SHA-256, SHA-384, SHA-512. MD5 and SHA-1 are strictly prohibited.`
      },
      {
        pageNumber: 6,
        title: 'KMS Key Lifecycle & Rotation',
        content: `Key Management Service (KMS):
▪ Master encryption keys must reside in Hardware Security Modules (HSM) or managed KMS (AWS KMS, Cloud KMS).
▪ Automated key rotation occurs annually.
▪ Dual-custody authorization required for key destruction.`
      },
      {
        pageNumber: 7,
        title: 'Validity, Enforcement & Distribution',
        content: `Validity and Document Management
This Policy document is effective from 12 January 2025. The owner of this document is the Chief Information Security Officer (CISO), who must review and, if necessary, update the document at least once a year.

Enforcement
Any employee who is found to have breached this policy may be subject to disciplinary action. Any violation of the policy by a permanent/temporary worker, contractor, or supplier may result in the termination of their contract or assignment.

Distribution
Table:
Name: All employees | Title: NA

End of Document`,
        sections: [
          {
            heading: 'Validity and Document Management',
            body: `This Policy document is effective from 12 January 2025. The owner of this document is the Chief Information Security Officer (CISO), who must review and, if necessary, update the document at least once a year.`
          },
          {
            heading: 'Enforcement',
            body: `Any employee who is found to have breached this policy may be subject to disciplinary action. Any violation of the policy by a permanent/temporary worker, contractor, or supplier may result in the termination of their contract or assignment.`
          },
          {
            heading: 'Distribution',
            table: {
              headers: ['Name', 'Title'],
              rows: [['All employees', 'NA']]
            }
          }
        ]
      }
    ],
    content: `# ${companyName} - Cryptographic & Key Management Policy
**Standard:** ${framework} | **Document No.:** ARP_ISMS_P02 | **Classification:** Private (Internal)

Requirements for TLS 1.3 transit encryption, AES-256 at-rest protection, KMS HSM hardware separation, and annual key rotation.`
  };

  return [
    accessControlPolicy,
    assetHandlingProcedure,
    infoSecPolicy,
    incidentProcedure,
    changeProcedure,
    cryptoPolicy
  ].map(doc => enrichDocumentWithConsultancyFeatures(doc, { companyName, effectiveDate: effectiveDateDefault }));
}
