/**
 * Client-Side Default Emergency Contacts & Seed Announcements for GramMitra
 * Ensures no village ever looks blank or broken.
 */

export interface EmergencyContact {
  id: string;
  title: string;
  category: "Health" | "Security" | "Utilities" | "Government";
  phoneNumber: string;
  description: string;
  isVerified: boolean;
}

export const GLOBAL_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: "emb-108",
    title: "108 Emergency Ambulance",
    category: "Health",
    phoneNumber: "108",
    description: "24/7 Primary Emergency Ambulance Service across Telangana & Andhra Pradesh",
    isVerified: true,
  },
  {
    id: "police-100",
    title: "100 Police Control Room",
    category: "Security",
    phoneNumber: "100",
    description: "Local Police Station & Inspector Emergency Assistance",
    isVerified: true,
  },
  {
    id: "electricity-1912",
    title: "1912 Electricity Helpline",
    category: "Utilities",
    phoneNumber: "1912",
    description: "TSSPDCL / APSPDCL Power Outage & Transformer Repair Helpline",
    isVerified: true,
  },
  {
    id: "women-181",
    title: "181 Women & Child Safety",
    category: "Security",
    phoneNumber: "181",
    description: "Immediate Protection & Distress Response Line for Women",
    isVerified: true,
  },
  {
    id: "health-104",
    title: "104 Health Information Line",
    category: "Health",
    phoneNumber: "104",
    description: "Free Tele-medicine, Health Advice & Mobile Medical Van Information",
    isVerified: true,
  },
  {
    id: "sarpanch-desk",
    title: "Gram Panchayat Sarpanch Desk",
    category: "Government",
    phoneNumber: "0841-23456",
    description: "Civic Issues, Streetlights, Drinking Water & Village Administration",
    isVerified: true,
  },
];

export function getVillageWelcomeAnnouncement(villageName: string) {
  const name = villageName && villageName !== "Smart Village" ? villageName : "your village";
  return {
    id: `welcome-${villageName}`,
    title: `🎉 Welcome to GramMitra ${name}!`,
    body: `Namaste villagers of ${name}! Welcome to your digital village hub. Use this platform to hire local workers, check crop prices, report civic problems, connect with Sarpanch, and read Gram Panchayat notices.`,
    author: "Gram Panchayat Desk",
    authorRole: "Panchayat Admin",
    timeAgo: "Pinned Update",
    isPinned: true,
    category: "Official Announcement",
  };
}
