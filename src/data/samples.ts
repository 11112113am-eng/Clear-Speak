export interface SampleDocument {
  id: string;
  title: string;
  category: 'medical' | 'legal' | 'government' | 'financial';
  label: string;
  description: string;
  text: string;
}

export const SAMPLE_DOCUMENTS: SampleDocument[] = [
  {
    id: 'medical-eob',
    title: 'Health Insurance Prior Authorization Denial',
    category: 'medical',
    label: 'Medical Notice',
    description: 'A formal letter denying coverage for a prescribed medication or procedure.',
    text: `RE: NOTICE OF ADVERSE BENEFIT DETERMINATION
Member ID: W90482180 | Claim No: CLM-99420-TX

Pursuant to Section 14.3 of your Evidence of Coverage, the request for prior authorization submitted by your attending physician for the prescribed pharmaceutical specialty agent has been subjected to retrospective and concurrent clinical utilization review.

Upon assessment by our medical review board, it has been determined that the requested medication does not meet the criteria for medical necessity as established under Formulary Guideline Tier-IV Therapeutic Protocols. Specifically, documented clinical records fail to demonstrate step-therapy trial and failure of Tier-I and Tier-II generic equivalents (Agent A and Agent B) prior to escalation to the non-preferred biologic entity. Consequently, benefit adjudication reflects full member financial responsibility of $1,420.00 in the event of non-compliant dispensing. You retain the statutory prerogative to submit an expedited first-level administrative appeal within sixty (60) calendar days of receipt hereof.`,
  },
  {
    id: 'legal-lease',
    title: 'Apartment Lease Indemnity & Termination Clause',
    category: 'legal',
    label: 'Legal Lease',
    description: 'A confusing clause from a standard residential apartment lease.',
    text: `SECTION 18: INDEMNIFICATION, WAIVER OF SUBROGATION, AND ACCELERATION UPON DEFAULT

The Lessee covenants and agrees to defend, indemnify, and hold harmless Lessor, its agents, employees, and mortgagees from and against any and all liabilities, encumbrances, damages, liens, penalties, causes of action, or disbursements arising from negligence or omission of Lessee or Lessee’s invitees occurring on or adjacent to the Demised Premises. 

In the event of anticipatory breach or premature vacatur prior to the designated Termination Date, Lessee shall remain strictly liable for liquidated damages equal to two (2) months’ base rent, forfeiture of the earnest money security deposit, and the immediate acceleration of all residual rent installments remaining under the unexpired term, notwithstanding Lessor’s statutory duty to mitigate damages under applicable municipal landlord-tenant statutes.`,
  },
  {
    id: 'government-benefits',
    title: 'Notice of Benefit Overpayment & Hearing Rights',
    category: 'government',
    label: 'Government Letter',
    description: 'An official state agency letter claiming an overpayment of unemployment or assistance.',
    text: `DEPARTMENT OF LABOR & WORKFORCE DEVELOPMENT
DIVISION OF UNEMPLOYMENT INSURANCE BENEFITS
DETERMINATION OF OVERPAYMENT AND RECOUPMENT DEMAND

Claimant Docket No: DL-88319-OVP

Notice is hereby provided pursuant to Administrative Code § 44-102 that an audit of your weekly claim certifications for calendar quarters Q2 and Q3 discloses that you received unemployment compensation disbursements in the aggregate sum of $2,184.00 to which you were not lawfully entitled, resulting from retroactive reconciliation of reported quarterly gross wages from employer ID #49281.

Demand is hereby made for restitution of said overpayment within thirty (30) calendar days from the mailing date of this instrument. Failure to remit payment or execute an approved statutory installment agreement may result in administrative wage garnishment, interception of state and federal tax refunds pursuant to treasury offset protocols, and a 15% statutory delinquency assessment. If you believe this determination was issued in error or that recoupment would offend equity and good conscience, you may file a written Petition for Administrative Review and Hearing Request postmarked no later than October 15th.`,
  },
  {
    id: 'financial-apr',
    title: 'Credit Card Interest Rate & Late Fee Amendment',
    category: 'financial',
    label: 'Financial Notice',
    description: 'A bank announcement detailing changes to annual percentage rates and penalty fees.',
    text: `IMPORTANT AMENDMENT TO YOUR CARDMEMBER AGREEMENT
Change in Terms Notice for Account Ending in 4018

Effective November 1st, the variable Annual Percentage Rate (APR) applicable to purchases and cash advances shall adjust dynamically. The Purchase APR will equal the highest U.S. Prime Rate published in the Money Rates table of The Wall Street Journal on the last business day of the billing cycle, plus a margin of 18.99 percentage points (currently resulting in an effective variable APR of 27.49%). 

Finance charges commence accruing on the transaction posting date without grace period eligibility if your total statement balance is not liquidated in full by the stipulated Due Date. Furthermore, the Penalty APR of 29.99% may be triggered upon occurrence of two (2) delinquent payments within six (6) consecutive cycles. A delinquency surcharge of up to $41.00 will be assessed against your outstanding balance for any cycle in which the Minimum Payment Due is not received by 5:00 PM Eastern Time on said Due Date.`,
  },
];
