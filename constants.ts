/* ==========================================================================
   IMPORTS
   ========================================================================== */
import { AppConfig, AppID } from './types';
import CorpMail from './components/apps/CorpMail';
import CorpBrowser from './components/apps/CorpBrowser';
import FirewallGame from './components/apps/FirewallGame';
import FirewallDefender from './components/apps/FirewallDefender';
import { KaliTerminal, KaliFileManager, KaliInstructions } from './components/apps/KaliApps';

/* ==========================================================================
   SYSTEM ASSETS & CONFIG
   ========================================================================== */
export const WALLPAPER_URL = "/assets/Wallpaper/wallpaper.png";

/* ==========================================================================
   APP DEFINITIONS
   ========================================================================== */
export const APPS: Record<AppID, AppConfig> = {
  corp_mail: {
    id: 'corp_mail',
    title: 'CorpMail',
    icon: '/assets/Icons/mail_icon.png',
    color: 'bg-transparent',
    component: CorpMail,
    defaultSize: { w: 960, h: 540 }
  },
  corp_browser: {
    id: 'corp_browser',
    title: 'Corp Browser',
    icon: '/assets/Icons/browser_icon.png',
    color: 'bg-transparent',
    component: CorpBrowser,
    defaultSize: { w: 1024, h: 600 }
  },
  firewall: {
    id: 'firewall',
    title: 'Firewall Defense',
    icon: '/assets/Icons/firewall_icon.png',
    color: 'bg-transparent',
    component: FirewallGame,
    defaultSize: { w: 1000, h: 600 }
  },
  firewall_defender: {
    id: 'firewall_defender',
    title: 'Firewall Defender',
    icon: '/assets/Icons/firewall_defender_icon.png',
    color: 'bg-transparent',
    component: FirewallDefender,
    defaultSize: { w: 1100, h: 700 }
  },
  kali_terminal: {
    id: 'kali_terminal',
    title: 'Terminal',
    icon: '/assets/Icons/terminal.png',
    color: 'bg-black',
    component: KaliTerminal,
    defaultSize: { w: 800, h: 600 }
  },
  kali_file_manager: {
    id: 'kali_file_manager',
    title: 'File Manager',
    icon: '/assets/Icons/folder.png',
    color: 'bg-gray-800',
    component: KaliFileManager,
    defaultSize: { w: 800, h: 600 }
  },
  kali_instructions: {
    id: 'kali_instructions',
    title: 'Instructions',
    icon: '/assets/Icons/txt-file.png',
    color: 'bg-white',
    component: KaliInstructions,
    defaultSize: { w: 900, h: 540 }
  }
};

export const INITIAL_DESKTOP_ICONS: AppID[] = [
  'corp_mail',
  'corp_browser',
  'firewall',
  'firewall_defender'
];

/* ==========================================================================
   UTILITY FUNCTIONS
   ========================================================================== */
// Generates realistic-looking email headers based on threat type and sender.
export const generateHeaders = (type: 'legit' | 'phishing' | 'funny' | 'ransomware' | 'malware' | 'ddos', fromName: string, subject: string, date: Date): string => {
  const messageId = Math.random().toString(36).substring(7);
  const isMalicious = type === 'phishing' || type === 'ransomware' || type === 'malware' || type === 'ddos';
  const domain = isMalicious ? 'suspicious-server.net' : 'corp.net';
  const fromEmail = isMalicious ? `alert@${domain}` : `${fromName.toLowerCase().replace(/\s/g, '.')}@corp.net`;
  const returnPath = isMalicious ? `bounce-${Math.floor(Math.random() * 9999)}@hacker-infrastructure.xyz` : fromEmail;
  const receiveIP = isMalicious ? `45.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` : '10.20.1.5';

  return `Return-Path: <${returnPath}>
Received: from ${isMalicious ? 'unknown' : 'mail.corp.net'} ([${receiveIP}])
        by mx-inbound.corp.net with ESMTP id ${Math.floor(Math.random() * 10000000)};
        ${date.toUTCString()}
Received-SPF: ${isMalicious ? 'SoftFail' : 'Pass'} (corp.net: domain of ${fromEmail} designates ${receiveIP} as permitted sender)
Authentication-Results: mx-inbound.corp.net;
        dkim=${isMalicious ? 'fail' : 'pass'};
        spf=${isMalicious ? 'softfail' : 'pass'};
Date: ${date.toUTCString()}
From: "${fromName}" <${fromEmail}>
To: "Employee" <employee@corp.net>
Message-ID: <${messageId}@${domain}>
Subject: ${subject}
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
X-Mailer: ${isMalicious ? 'PHP/7.4.3' : 'CorpMail Enterprise v4.5'}
X-Priority: ${type === 'legit' && subject.includes('URGENT') ? '1 (Highest)' : '3 (Normal)'}
X-Corp-Scanner: ${isMalicious ? 'Flagged' : 'Clean'}
X-Originating-IP: [${receiveIP}]
`;
};

/* ==========================================================================
   EMAIL TEMPLATES
   ========================================================================== */
export const EMAIL_TEMPLATES = {
  legit: [
    { from: "IT Support", subject: "Planned Maintenance", body: "Server maintenance scheduled for tonight at 2 AM. Please save your work. Details: https://intranet.corp.sec/maintenance" },
    { from: "Team Lead", subject: "Meeting Agenda", body: "Attached is the agenda for tomorrow's standup. Please review beforehand: https://intranet.corp.sec/meetings/agenda" },
    { from: "Payroll", subject: "Payslip Available", body: "Your payslip for this month is now available for download on the portal: https://intranet.corp.sec/payroll" },
    { from: "Office Admin", subject: "Fridge Cleaning", body: "Please remove all personal items from the fridge by Friday 5 PM." },
    { from: "HR Dept", subject: "Holiday Party RSVP", body: "Don't forget to RSVP for the annual holiday party by next Tuesday!" },
    { from: "Facilities", subject: "AC Repair", body: "Maintenance will be fixing the AC on the 4th floor tomorrow morning. Expect some noise." },
    { from: "Project Manager", subject: "Timeline Update", body: "We are pushing the deadline by two days due to the API delay. Updated Gantt chart attached." },
    { from: "CEO", subject: "Q3 Town Hall", body: "Join us for the all-hands meeting this Friday at 10 AM. Zoom link attached." },
    { from: "Marketing", subject: "New Brand Assets", body: "The new logo pack is available on the shared drive. Please update your email signatures." },
    { from: "Legal", subject: "Compliance Training", body: "Reminder: Annual compliance training modules are due by end of month." },
    { from: "DevOps", subject: "Build Failed: Backend-Main", body: "The latest commit broke the build. Please investigate immediately." },
    { from: "Reception", subject: "Package Delivery", body: "You have a package waiting at the front desk." },
    { from: "Internal Comms", subject: "Newsletter: June Edition", body: "Check out what's happening around the company this month!" },
    { from: "Security", subject: "Badge Access", body: "Your building access badge will expire in 30 days. Please visit security office to renew." },
    { from: "Finance", subject: "Expense Report Returned", body: "Your expense report #4421 has been returned for missing receipts." },
    { from: "IT Helpdesk", subject: "Ticket #9921 resolved", body: "Your ticket regarding 'Mouse not working' has been marked as resolved." },
    { from: "Cafeteria", subject: "Menu for next week", body: "Monday: Tacos. Tuesday: Pizza. Wednesday: Salad Bar." },
    { from: "Training", subject: "Workshop: Excel Advanced", body: "Sign up for the Advanced Excel workshop happening next Wednesday." },
    { from: "Recruitment", subject: "Referral Bonus", body: "We are hiring! Refer a friend and get a $1000 bonus if they are hired." },
    { from: "Ops", subject: "Printer B out of ink", body: "Toner has been ordered. Please use Printer A in the meantime." }
  ],
  funny: [
    { from: "Kevin (Sales)", subject: "Who ate my yogurt?", body: "Seriously guys, it had my name on it. It was blueberry." },
    { from: "Dwight", subject: "Bears, Beets, Battlestar Galactica", body: "Identify theft is not a joke, Jim! Millions of families suffer every year!" },
    { from: "Fun Committee", subject: "Pizza Friday!", body: "Join us in the break room at 12 PM for free pizza. First come first served!" },
    { from: "Karen (Acct)", subject: "Cat pics", body: "Look at Mr. Whiskers in his little tie! So cute!" },
    { from: "All Staff", subject: "Found: Left Shoe", body: "Someone left a single left shoe in the conference room. Why?" },
    { from: "Dave (Eng)", subject: "Rubber Duck Missing", body: "My debugging duck is gone. I cannot code without him. Please return." },
    { from: "Intern", subject: "How do I print?", body: "Sorry to reply all, but does anyone know how to add the printer?" },
    { from: "Kitchen Police", subject: "DIRTY MUGS", body: "The sink is not a dishwasher. WASH YOUR MUGS." }
  ],
  phishing: [
    { from: "HR Services", subject: "Action Required: Benefit Enrolment", body: "Your benefits enrolment for the next period is incomplete. Please log in to the portal to confirm your choices by EOD: https://intranet.corp.sec/hr-benefits/confirm" },
    { from: "System Administrator", subject: "Abnormal Login Detected", body: "We detected an unusual login to your account from an unrecognized IP address. If this was not you, please secure your account here: http://intranet-corp-sec.hacker-infrastructure.xyz/secure-login" },
    { from: "CEO (Urgent)", subject: "Wire Transfer Needed", body: "I am in a meeting and can't talk. Please wire $5000 to this account immediately for a confidential vendor: http://hacker-infrastructure.xyz/wire-transfer" },
    { from: "Apple Support", subject: "Your account is locked", body: "We detected suspicious activity. Click here to unlock your Apple ID immediately: http://suspicious-link.com/apple-id-verify" },
    { from: "Lottery Winner", subject: "YOU WON $1,000,000", body: "Kindly reply with your bank details to claim your massive prize: http://suspicious-link.com/lottery-claim" },
    { from: "Netflix", subject: "Payment Declined", body: "We could not process your payment. Update your card details to keep watching: http://netflix-secure-update.com" },
    { from: "Microsoft 365", subject: "Password Expiry Warning", body: "Your password expires today. Retain your same password by clicking here: http://microsoft-auth-reset.net" },
    { from: "Amazon", subject: "Order Confirmation #9921", body: "Thank you for your order of 'Gaming Laptop ($2400)'. If you did not make this purchase, cancel here: http://amazon-cancel-order.net" },
    { from: "IRS", subject: "Tax Refund Notification", body: "You are eligible for a tax refund of $450. Claim it now via our portal: http://irs-gov-refund-claim.com" },
    { from: "LinkedIn", subject: "You appeared in 5 searches", body: "See who is looking at your profile: http://linkedin-view-profile.com" }
  ],
  malware: [
    { from: "Scanner", subject: "Scan_Document_0023.pdf.exe", body: "Please find attached the scanned document from the photocopier.\n\nAttachment: Scan_Document_0023.pdf.exe (2.4MB)" },
    { from: "HR", subject: "Salary Increase", body: "Open the attached PDF to see your new salary structure: http://hacker-infrastructure.xyz/salary-update.exe" },
    { from: "IT Support", subject: "Install New VPN Client", body: "The old VPN client is deprecated. Please run the attached installer to connect to the network.\n\nVPN_Installer_v5.msi.bat" },
    { from: "Vendor", subject: "Invoice #INV-2024-001", body: "Please find attached the outstanding invoice. Payment is due.\n\nAttachment: INVOICE_DETAILS.js" },
    { from: "Resume", subject: "Job Application - John Doe", body: "Hi, I'm applying for the role. My CV is attached.\n\nAttachment: Resume_JohnDoe.doc.scr" }
  ],
  ransomware: [
    { from: "UNKNOWN", subject: "YOUR FILES ARE ENCRYPTED", body: "All your files have been encrypted with a military-grade algorithm. To restore access, you must pay 5 BTC to the wallet address below within 24 hours.\n\nWallet: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa\n\nIf you do not pay, your data will be permanently lost." },
    { from: "Security Alert", subject: "Payment Overdue - Final Notice", body: "We have gained access to your sensitive client data. Pay us immediately or we release it to the public.\n\nLink: http://darkweb-leak-site.onion" },
    { from: "LockBit", subject: "You have been hacked", body: "We are LockBit. Your systems are compromised. We have downloaded 5TB of data. Contact us to negotiate price.\n\nTor Link: http://lockbit-supp.onion" }
  ],
  ddos: [
    { from: "Network Ops", subject: "High Latency Warning", body: "Automated Alert: High latency detected on gateway 192.168.1.1. Packet loss > 45%. Possible UDP flood." },
    { from: "Webmaster", subject: "Website Down", body: "The corporate website is returning 503 Errors. Access logs show 500,000 requests per second from botnet IPs." },
    { from: "Firewall", subject: "Traffic Spike Detected", body: "Inbound traffic has exceeded 10Gbps threshold. Mitigation protocols active." }
  ],
  network: [
    { from: "Network Ops", subject: "High Latency Warning", body: "Automated Alert: High latency detected on gateway 192.168.1.1. Packet loss > 45%. Possible UDP flood." },
    { from: "Webmaster", subject: "Website Down", body: "The corporate website is returning 503 Errors. Access logs show 500,000 requests per second from botnet IPs." },
    { from: "Firewall", subject: "Traffic Spike Detected", body: "Inbound traffic has exceeded 10Gbps threshold. Mitigation protocols active." }
  ]
};

/* ==========================================================================
   SHIFT CONFIGURATIONS
   ========================================================================== */
export const SHIFT_CONFIGS = [
  {
    day: 1,
    durationRealTimeSecs: 480
  },
  {
    day: 2,
    durationRealTimeSecs: 480
  },
  {
    day: 3,
    durationRealTimeSecs: 480
  },
  {
    day: 4,
    durationRealTimeSecs: 480
  },
  {
    day: 5,
    durationRealTimeSecs: 480
  }
];