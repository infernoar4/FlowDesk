import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  HelpCircle,
  X,
  Ticket,
  CalendarDays,
  Boxes,
  DoorOpen,
  Search,
  ChevronDown,
  ChevronUp,
  LifeBuoy,
  ArrowRight,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui-kit/Button";

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

type HelpCategory = "all" | "tickets" | "leaves" | "assets" | "rooms" | "faqs";

interface FAQItem {
  id: string;
  category: "tickets" | "leaves" | "assets" | "rooms" | "general";
  question: string;
  answer: string;
  steps?: string[];
  linkTo?: string;
  linkText?: string;
}

const FAQS: FAQItem[] = [
  {
    id: "faq-1",
    category: "tickets",
    question: "How do I raise a new IT ticket?",
    answer:
      "You can submit an IT support ticket whenever you experience technical issues with hardware, software, or network access.",
    steps: [
      "Click the '+ New Ticket' button on the Dashboard or top header.",
      "Select an Issue Category (e.g. Hardware, Software, Network).",
      "Set the Priority (Low, Medium, High, Critical).",
      "Enter a title and description explaining your problem.",
      "Click 'Submit Ticket' to send it to the Support Team.",
    ],
    linkTo: "/tickets",
    linkText: "Go to Tickets Module",
  },
  {
    id: "faq-2",
    category: "leaves",
    question: "How do I apply for time off or a half-day leave?",
    answer:
      "Leave applications allow you to request time off, comp off, or a half-day leave for manager approval.",
    steps: [
      "Go to Leave Requests from the left sidebar.",
      "Click 'Apply for Time Off'.",
      "Choose your Leave Type (Casual Leave, Sick Leave, Half Day).",
      "If applying for a 'Half Day', the End Date field automatically hides so you only select a single date.",
      "Enter your reason and click 'Submit Request'.",
    ],
    linkTo: "/leave-requests",
    linkText: "Apply for Leave",
  },
  {
    id: "faq-3",
    category: "assets",
    question: "How do I request a laptop or peripheral equipment?",
    answer:
      "You can request work hardware such as laptops, external monitors, keyboards, or headsets directly through FlowDesk.",
    steps: [
      "Navigate to the Assets page from the sidebar.",
      "Click 'Request Asset'.",
      "Select the hardware category and urgency level.",
      "State why you need the equipment.",
      "Click 'Submit Request' — Support engineers will review and assign your device.",
    ],
    linkTo: "/assets",
    linkText: "Request Asset",
  },
  {
    id: "faq-4",
    category: "assets",
    question: "How do I return assigned hardware equipment?",
    answer:
      "When releasing assigned equipment back to IT inventory, you can initiate an asset return request.",
    steps: [
      "Go to Assets → My Assigned Assets.",
      "Click 'Return Asset' on the device you want to hand back.",
      "Support engineers will review the return and verify the physical hardware to mark it available.",
    ],
    linkTo: "/assets",
    linkText: "View My Assets",
  },
  {
    id: "faq-5",
    category: "rooms",
    question: "How do I book a meeting room and avoid conflicts?",
    answer:
      "Room booking lets you reserve meeting spaces for your team with automated conflict detection.",
    steps: [
      "Go to Meeting Rooms from the sidebar.",
      "Click 'Book Room' on your desired room.",
      "Select the Date, Start Time, and End Time.",
      "If another meeting is already booked at that time, an instant warning notification will highlight the conflict and prevent double-booking.",
      "Click 'Book Room' to complete your reservation.",
    ],
    linkTo: "/meeting-rooms",
    linkText: "Book Meeting Room",
  },
  {
    id: "faq-6",
    category: "general",
    question: "How do I switch between Employee, Support, and Manager roles?",
    answer:
      "Use the Role Switcher dropdown located in the top navigation bar to test different user personas.",
    steps: [
      "Click 'Role' in the top header bar.",
      "Select 'Alex (Employee)', 'Rahul Verma (Support)', or 'Manager / HR'.",
      "The interface updates instantly to display persona-specific tools and views.",
    ],
  },
];

export function HelpModal({ open, onClose }: HelpModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<HelpCategory>("all");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>("faq-1");

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return FAQS.filter((faq) => {
      if (activeTab !== "all" && activeTab !== "faqs" && faq.category !== activeTab) {
        return false;
      }
      if (!q) return true;
      const hay =
        `${faq.question} ${faq.answer} ${faq.category} ${(faq.steps || []).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [searchQuery, activeTab]);

  if (!open) return null;

  const toggleFaq = (id: string) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card w-full max-w-2xl rounded-xl border border-border shadow-elevated overflow-hidden animate-in fade-in-50 zoom-in-95 max-h-[90vh] flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Help & Knowledge Center</h2>
              <p className="text-xs text-muted-foreground">
                Simple step-by-step guides for all FlowDesk modules.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Interactive Search Bar & Category Navigation */}
        <div className="px-6 pt-4 pb-2 border-b border-border bg-muted/20 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help topics (e.g. ticket, leave, laptop, room conflict)..."
              className="w-full h-10 pl-9 pr-4 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-ring transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {(
              [
                { id: "all", label: "All Guides" },
                { id: "tickets", label: "Tickets" },
                { id: "leaves", label: "Leaves" },
                { id: "assets", label: "Assets" },
                { id: "rooms", label: "Rooms" },
                { id: "faqs", label: "FAQs" },
              ] as { id: HelpCategory; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 h-7 rounded-md font-medium transition-colors shrink-0 ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-background border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive FAQ Content List */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Quick IT Desk Contact Box */}
          <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-indigo-500/10 border border-primary/20 p-4 text-xs text-foreground flex items-start gap-3">
            <LifeBuoy className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-foreground mb-0.5">
                Need Direct Support Assistance?
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Reach out to the IT Help Desk directly at{" "}
                <span className="font-semibold text-foreground">support@flowdesk.co</span> or submit
                a ticket under the Tickets module.
              </p>
            </div>
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No help topics matched "<span className="font-semibold">{searchQuery}</span>". Try
              searching for{" "}
              <span
                className="text-primary cursor-pointer hover:underline"
                onClick={() => setSearchQuery("ticket")}
              >
                ticket
              </span>
              ,{" "}
              <span
                className="text-primary cursor-pointer hover:underline"
                onClick={() => setSearchQuery("leave")}
              >
                leave
              </span>
              , or{" "}
              <span
                className="text-primary cursor-pointer hover:underline"
                onClick={() => setSearchQuery("room")}
              >
                room
              </span>
              .
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isExpanded = expandedFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="rounded-xl border border-border bg-background overflow-hidden transition-all shadow-soft"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full px-4 py-3.5 flex items-center justify-between text-left gap-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {faq.category === "tickets" && (
                          <Ticket className="h-4 w-4 text-primary shrink-0" />
                        )}
                        {faq.category === "leaves" && (
                          <CalendarDays className="h-4 w-4 text-indigo-500 shrink-0" />
                        )}
                        {faq.category === "assets" && (
                          <Boxes className="h-4 w-4 text-amber-500 shrink-0" />
                        )}
                        {faq.category === "rooms" && (
                          <DoorOpen className="h-4 w-4 text-emerald-500 shrink-0" />
                        )}
                        {faq.category === "general" && (
                          <UserCheck className="h-4 w-4 text-primary shrink-0" />
                        )}
                        <span className="text-sm font-medium text-foreground">{faq.question}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-border/50 text-xs space-y-3 animate-in fade-in-50">
                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>

                        {faq.steps && (
                          <div className="space-y-1.5 bg-muted/30 rounded-lg p-3 border border-border/50">
                            <div className="font-semibold text-foreground text-[11px] uppercase tracking-wider mb-1">
                              Step-by-Step Instructions:
                            </div>
                            <ol className="space-y-1.5">
                              {faq.steps.map((step, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-foreground">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {faq.linkTo && (
                          <div className="pt-1">
                            <Link
                              to={faq.linkTo}
                              onClick={onClose}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                            >
                              {faq.linkText} <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-border bg-card flex justify-between items-center text-xs">
          <span className="text-muted-foreground">FlowDesk Knowledge Base v2.0</span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </footer>
      </div>
    </div>
  );
}
