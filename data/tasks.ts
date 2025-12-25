import { Task } from '../types';

export const tasks: Task[] = [
  {
    id: 'apply-for-pan',
    title: 'Apply for a PAN Card',
    purpose: 'A PAN card is essential for financial transactions, filing income tax returns, and as a proof of identity.',
    timeRequired: '7-15 Days',
    difficulty: 'Easy',
    category: 'Documents',
    overview: {
      what: 'A Permanent Account Number (PAN) is a ten-digit alphanumeric number, issued by the Income Tax Department.',
      why: 'It is required for almost all financial transactions such as receiving taxable salary, sale or purchase of assets above specified limits, and buying mutual funds.',
      who: 'Any Indian citizen, NRI, or foreign citizen can apply for a PAN card.',
    },
    steps: [
      { id: '1', title: 'Visit the Official Portal', description: 'Go to the NSDL or UTIITSL website, the two government-authorized portals for PAN applications.', timeEstimate: '5 mins' },
      { id: '2', title: 'Fill Form 49A', description: 'Select "New PAN" and fill out Form 49A with your personal details accurately. Ensure there are no spelling mistakes.', timeEstimate: '20 mins' },
      { id: '3', title: 'Upload Documents', description: 'Upload scanned copies of your proof of identity (like Aadhaar), proof of address, and proof of date of birth.', timeEstimate: '10 mins' },
      { id: '4', title: 'Pay the Fee', description: 'Pay the application fee online using a debit card, credit card, or net banking. The fee is usually around ₹110 for Indian citizens.', timeEstimate: '5 mins' },
      { id: '5', title: 'Receive Acknowledgement', description: 'After successful payment, you will receive an acknowledgement slip with a 15-digit number. Save this for tracking.', timeEstimate: '2 mins' },
      { id: '6', title: 'Track and Receive', description: 'You can track your application status using the acknowledgement number. The physical PAN card will be delivered to your address.', timeEstimate: '7-15 days' },
    ],
    commonMistakes: [
      'Incorrectly spelling your name or father\'s name.',
      'Uploading unclear or invalid documents.',
      'Mismatch between the details on the form and the documents.',
    ],
    officialLinks: [
      { title: 'NSDL PAN Portal', url: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html' },
      { title: 'UTIITSL PAN Portal', url: 'https://www.pan.utiitsl.com/PAN/' },
    ],
    completionMethods: ['Online', 'CSC Center'],
    relevantFor: ['general', 'working', 'student'],
    moreInfo: { type: 'video', url: 'https://www.youtube.com/watch?v=G8_4a-TSL7Y', title: 'How to Apply for PAN Card Online' },
  },
  {
    id: 'open-bank-account',
    title: 'Open a Savings Bank Account',
    purpose: 'To securely save money, earn interest, and access banking services like digital payments and loans.',
    timeRequired: '1-3 Days',
    difficulty: 'Easy',
    category: 'Bank',
    overview: {
        what: 'A savings account is a basic deposit account held at a bank or financial institution.',
        why: 'It promotes the habit of saving, provides safety for your money, and is necessary for most digital transactions, subsidies (DBT), and investments.',
        who: 'Any resident Indian citizen can open a savings account. Certain accounts can be opened with zero balance under schemes like PMJDY.',
    },
    steps: [
        { id: '1', title: 'Choose a Bank', description: 'Select a bank based on your needs, such as proximity, services offered, and minimum balance requirements.', timeEstimate: '30 mins' },
        { id: '2', title: 'Gather KYC Documents', description: 'Collect your KYC (Know Your Customer) documents, which typically include Proof of Identity (Aadhaar, Voter ID) and Proof of Address (Electricity Bill, Passport).', timeEstimate: '15 mins' },
        { id: '3', title: 'Visit the Bank or Apply Online', description: 'You can either visit the nearest branch of the selected bank or apply online through their official website.', timeEstimate: '1 hour' },
        { id: '4', title: 'Fill the Account Opening Form', description: 'Fill the form with your personal details, nominee information, and other required fields.', timeEstimate: '20 mins' },
        { id: '5', title: 'Submit Documents and Initial Deposit', description: 'Submit your KYC documents and make an initial deposit if required. Some accounts can be opened with zero balance.', timeEstimate: '15 mins' },
        { id: '6', title: 'Receive Your Welcome Kit', description: 'Once your account is opened, you will receive a welcome kit containing your passbook, cheque book, and debit card.', timeEstimate: '3-7 days' },
    ],
    commonMistakes: [
        'Not having original documents for verification at the branch.',
        'Providing an address that does not match the proof document.',
        'Forgetting to add a nominee to the account.',
    ],
    officialLinks: [
        { title: 'RBI - Types of Bank Accounts', url: 'https://www.rbi.org.in/commonperson/English/Scripts/Accounts.aspx' },
        { title: 'Pradhan Mantri Jan Dhan Yojana (PMJDY)', url: 'https://pmjdy.gov.in/' }
    ],
    completionMethods: ['Bank', 'Online'],
    relevantFor: ['general', 'student', 'working', 'parent', 'senior'],
    moreInfo: { type: 'article', url: 'https://www.bankbazaar.com/savings-account/how-to-open-a-bank-account.html', title: 'Detailed Guide on Opening a Bank Account' },
  },
  {
    id: 'apply-for-driving-license',
    title: 'Get a Driving License',
    purpose: 'To legally drive a motor vehicle on public roads in India.',
    timeRequired: '30-45 Days',
    difficulty: 'Medium',
    category: 'Documents',
    overview: {
        what: 'A Driving License is a document issued by the Regional Transport Office (RTO) authorizing an individual to drive a vehicle.',
        why: 'It is a mandatory document for driving and serves as a valid proof of identity.',
        who: 'Anyone over 16 (for non-geared motorcycles) or 18 (for cars and geared motorcycles) can apply after passing the required tests.',
    },
    steps: [
        { id: '1', title: 'Apply for Learner\'s License', description: 'First, apply for a Learner\'s License online through the Parivahan Sewa portal or by visiting the RTO.', timeEstimate: '1 hour' },
        { id: '2', title: 'Pass the Learner\'s Test', description: 'Appear for the Learner\'s License test, which is usually an online test on traffic rules and signs.', timeEstimate: '30 mins' },
        { id: '3', title: 'Practice Driving', description: 'After getting your Learner\'s License, you must practice driving for at least 30 days before applying for a permanent license.', timeEstimate: '30 days' },
        { id: '4', title: 'Apply for Permanent License', description: 'Within 6 months of getting your Learner\'s License, apply for the permanent one online.', timeEstimate: '30 mins' },
        { id: '5', title: 'Pass the Driving Test', description: 'Book a slot and appear for the practical driving test at the RTO with your vehicle.', timeEstimate: '2 hours' },
        { id: '6', title: 'Receive Your License', description: 'After passing the test, your Driving License will be sent to your registered address by post.', timeEstimate: '15-20 days' },
    ],
    commonMistakes: [
        'Not carrying all necessary documents to the RTO.',
        'Failing to practice adequately before the driving test.',
        'Letting the Learner\'s License expire before applying for the permanent one.',
    ],
    officialLinks: [
        { title: 'Parivahan Sewa Portal', url: 'https://parivahan.gov.in/parivahan/' },
    ],
    completionMethods: ['Government Office'],
    relevantFor: ['general', 'student', 'working'],
  },
  {
    id: 'check-pf-balance',
    title: 'Check Your PF Balance',
    purpose: 'To know the total amount in your Employees\' Provident Fund (EPF) account, which is a retirement savings scheme.',
    timeRequired: '5 Mins',
    difficulty: 'Easy',
    category: 'Finance',
    overview: {
        what: 'The Employees\' Provident Fund (EPF) is a retirement benefit scheme for salaried employees in India.',
        why: 'Checking your balance helps you track your retirement savings, ensure your employer is contributing, and plan your finances.',
        who: 'Any salaried employee who is a member of the EPFO.',
    },
    steps: [
        { id: '1', title: 'Visit EPFO Portal', description: 'Go to the EPFO Member Passbook portal.', timeEstimate: '1 min' },
        { id: '2', title: 'Login with UAN', description: 'Log in using your Universal Account Number (UAN), password, and the captcha.', timeEstimate: '2 mins' },
        { id: '3', title: 'Select Member ID', description: 'If you have worked in multiple organizations, select the Member ID for the relevant employment.', timeEstimate: '1 min' },
        { id: '4', title: 'View Passbook', description: 'Click on "View Passbook" to see your EPF balance and a detailed statement of contributions.', timeEstimate: '1 min' },
    ],
    commonMistakes: [
        'Forgetting your UAN password.',
        'UAN not being activated.',
        'Not having your mobile number linked with your UAN.',
    ],
    officialLinks: [
        { title: 'EPFO Member Passbook Portal', url: 'https://passbook.epfindia.gov.in/MemberPassBook/Login' },
    ],
    completionMethods: ['Online'],
    relevantFor: ['working'],
  }
];