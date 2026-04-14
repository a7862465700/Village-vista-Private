const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak
} = require("docx");

const border = { style: BorderStyle.SINGLE, size: 1, color: "999999" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ heading: level, spacing: { before: 300, after: 150 }, children: [new TextRun({ text, bold: true })] });
}

function para(text, opts = {}) {
  const runs = [];
  // Parse bold markers **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  for (const part of parts) {
    if (part.startsWith("**") && part.endsWith("**")) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true, font: "Times New Roman", size: 22 }));
    } else {
      runs.push(new TextRun({ text: part, font: "Times New Roman", size: 22, ...opts }));
    }
  }
  return new Paragraph({ spacing: { after: 120 }, children: runs });
}

function indentPara(text) {
  const runs = [];
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  for (const part of parts) {
    if (part.startsWith("**") && part.endsWith("**")) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true, font: "Times New Roman", size: 22 }));
    } else {
      runs.push(new TextRun({ text: part, font: "Times New Roman", size: 22 }));
    }
  }
  return new Paragraph({
    spacing: { after: 100 },
    indent: { left: 720 },
    children: runs
  });
}

function sectionBreak() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC", space: 1 } },
    children: []
  });
}

function tableRow(label, value = "") {
  return new TableRow({
    children: [
      new TableCell({
        borders, width: { size: 4000, type: WidthType.DXA }, margins: cellMargins,
        shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, font: "Times New Roman", size: 20 })] })]
      }),
      new TableCell({
        borders, width: { size: 5360, type: WidthType.DXA }, margins: cellMargins,
        children: [new Paragraph({ children: [new TextRun({ text: value, font: "Times New Roman", size: 20 })] })]
      })
    ]
  });
}

function feeRow(service, fee = "") {
  return new TableRow({
    children: [
      new TableCell({
        borders, width: { size: 6000, type: WidthType.DXA }, margins: cellMargins,
        children: [new Paragraph({ children: [new TextRun({ text: service, font: "Times New Roman", size: 20 })] })]
      }),
      new TableCell({
        borders, width: { size: 3360, type: WidthType.DXA }, margins: cellMargins,
        children: [new Paragraph({ children: [new TextRun({ text: fee, font: "Times New Roman", size: 20 })] })]
      })
    ]
  });
}

function sigLine(label) {
  return [
    new Paragraph({ spacing: { before: 400, after: 0 }, children: [] }),
    new Paragraph({
      spacing: { after: 40 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000", space: 1 } },
      children: [new TextRun({ text: "                                                                                              ", font: "Times New Roman", size: 22 })]
    }),
    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: label, font: "Times New Roman", size: 20, italics: true })] }),
  ];
}

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Times New Roman", size: 22 } }
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Times New Roman" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Times New Roman" },
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 }
      },
    ]
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Hickory Street Finance LLC \u2014 Loan Servicing Agreement", font: "Times New Roman", size: 18, italics: true, color: "666666" })]
          })]
        })
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Page ", font: "Times New Roman", size: 18, color: "666666" }),
              new TextRun({ children: [PageNumber.CURRENT], font: "Times New Roman", size: 18, color: "666666" }),
            ]
          })]
        })
      },
      children: [
        // TITLE
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "LOAN SERVICING AGREEMENT", bold: true, font: "Times New Roman", size: 36 })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [new TextRun({ text: "Hickory Street Finance LLC", bold: true, font: "Times New Roman", size: 28 })]
        }),

        // PREAMBLE
        para("This Loan Servicing Agreement, including all referenced exhibits and fee schedules (together the \u201CAgreement\u201D) is between **Hickory Street Finance LLC** (\u201CServicing Agent\u201D) and the note buyer or lender whose signature appears below (the \u201CLender\u201D) (Servicing Agent and Lender may be referred to individually as a \u201CParty\u201D and collectively as \u201CParties\u201D)."),
        para("The Parties agree as follows:"),

        sectionBreak(),

        // SECTION 1
        heading("1.0  Scope of Services", HeadingLevel.HEADING_1),

        indentPara("**1.0.1**  Lender retains Servicing Agent as Lender\u2019s agent to employ commercially reasonable and prudent practices to collect all scheduled payments from a borrower (\u201CBorrower\u201D), including the final payoff, and to protect the security on present and future loans subject to this Agreement (each a \u201CLoan\u201D), which Loan may be secured by real property, a deed of trust, land contract, or contract for deed (each a \u201CProperty\u201D)."),

        indentPara("**1.0.2**  Servicing Agent shall provide the following services on behalf of Lender:"),
        indentPara("(a) Collect all scheduled Loan payments from Borrower, including principal, interest, late fees, and any other amounts due;"),
        indentPara("(b) Issue monthly statements or payment coupons to Borrower;"),
        indentPara("(c) Process and collect payoff demands;"),
        indentPara("(d) Issue annual income tax statements (Form 1098/1099) to Borrower and Lender as required by law;"),
        indentPara("(e) Respond to Borrower inquiries, demands, and requests;"),
        indentPara("(f) Monitor property insurance and tax compliance as applicable;"),
        indentPara("(g) Provide Lender access to the Hickory Street Finance online portal to view loan status, payment history, and related documentation;"),
        indentPara("(h) Disburse collected funds to Lender per the schedule outlined in this Agreement."),

        indentPara("**1.0.3**  Funds received from Borrower shall be applied toward the Loan in the following order: (a) interest due for the applicable period; (b) servicing fees owed to Servicing Agent; (c) late fees; (d) principal balance."),

        indentPara("**1.0.4**  Servicing Agent shall consult with and follow instruction from Lender on non-routine collection matters. Services that Servicing Agent will not perform without specific written instructions from Lender include, but are not limited to: (a) initiating a foreclosure process; (b) force-placing insurance; (c) adjusting interest rates; and (d) modifying loan terms."),

        sectionBreak(),

        // SECTION 2
        heading("2.0  Term and Termination", HeadingLevel.HEADING_1),

        indentPara("**2.0.1**  This Agreement shall become effective (the \u201CEffective Date\u201D) upon the date it is signed by both Parties."),
        indentPara("**2.0.2**  Either Party may terminate this Agreement by providing thirty (30) days\u2019 written notice to the other Party."),
        indentPara("**2.0.3**  Upon termination by Lender, Lender shall immediately pay Servicing Agent: (a) any outstanding servicing fees; (b) any advances made by Servicing Agent on Lender\u2019s behalf; and (c) a transfer fee as set forth in the Fee Schedule (Exhibit B)."),
        indentPara("**2.0.4**  Upon termination by Servicing Agent, Servicing Agent shall: (a) deliver to Lender all of Lender\u2019s funds; (b) provide appropriate accounting and final statements; and (c) deliver all loan documentation in Servicing Agent\u2019s possession."),
        indentPara("**2.0.5**  This Agreement shall also terminate when the Loan is paid in full and any applicable reconveyance or release has been filed."),
        indentPara("**2.0.6**  Prior to the effectiveness of any termination, Servicing Agent shall cooperate with the orderly transfer of servicing to Lender or Lender\u2019s designated successor servicer in accordance with Section 9.0."),

        sectionBreak(),

        // SECTION 3
        heading("3.0  Specific Loan Servicing Functions", HeadingLevel.HEADING_1),

        indentPara("**3.0.1**  Servicing Agent shall:"),
        indentPara("(a) Issue payment coupons or monthly statements to Borrower directing Loan repayment to Servicing Agent;"),
        indentPara("(b) Issue payoff demands and beneficiary statements;"),
        indentPara("(c) Demand, receive, and collect all Loan payments;"),
        indentPara("(d) Approve, collect, and process payoffs, depositing all funds into Servicing Agent\u2019s trust or escrow account;"),
        indentPara("(e) Release collected funds to Lender in accordance with Servicing Agent\u2019s standard disbursement schedule;"),
        indentPara("(f) Issue annual income tax statements to Borrower and Lender;"),
        indentPara("(g) Answer Borrower inquiries, demands, and requests;"),
        indentPara("(h) Grant appropriate payment deferrals (but not extensions of loan maturity) only with prior approval of Lender;"),
        indentPara("(i) If so retained, monitor the continued effectiveness and claims on any property insurance;"),
        indentPara("(j) If so retained, monitor property tax payments and delinquencies;"),
        indentPara("(k) Promptly communicate to Lender any material information about collection of the Loan."),

        indentPara("**3.0.2**  Servicing Agent will not commingle its assets with Lender\u2019s payments. All Lender and Borrower funds will be held in a segregated account."),

        sectionBreak(),

        // SECTION 4
        heading("4.0  Compensation", HeadingLevel.HEADING_1),

        indentPara("**4.0.1**  For its services, Servicing Agent shall be paid the fees reflected in the Fee Schedule attached as Exhibit B."),
        indentPara("**4.0.2**  Servicing Agent\u2019s fees are based on services rendered, not on Borrower\u2019s payment performance. Should Borrower default, Servicing Agent is still entitled to fees for services performed."),
        indentPara("**4.0.3**  Servicing Agent is authorized by Lender to deduct any outstanding amounts owed by Lender from Loan proceeds prior to disbursement to Lender."),
        indentPara("**4.0.4**  Fees are subject to change upon thirty (30) days\u2019 written notice to Lender. Lender may avoid changes by providing thirty (30) days\u2019 written notice to terminate this Agreement."),
        indentPara("**4.0.5**  A setup fee shall be due at the time of Loan submission. If said fee is absent from the setup package, Lender acknowledges that Servicing Agent may debit Lender proceeds to recover amounts owed."),

        sectionBreak(),

        // SECTION 5
        heading("5.0  Loan Documents", HeadingLevel.HEADING_1),

        indentPara("**5.0.1**  Servicing Agent may retain custody of the original note and deed of trust, land contract, or other security instrument for the Loan."),
        indentPara("**5.0.2**  Due care will be taken by Servicing Agent to protect and secure said documents. Should any loan documents be lost or destroyed for reasons other than gross negligence, Lender agrees to hold Servicing Agent harmless."),
        indentPara("**5.0.3**  Lender may request copies of loan documents at any time. Servicing Agent may charge a reasonable fee for document reproduction."),

        sectionBreak(),

        // SECTION 6
        heading("6.0  Lender Representations and Warranties", HeadingLevel.HEADING_1),

        para("Lender hereby represents and warrants to Servicing Agent the following:"),
        indentPara("(a) Lender is the lawful owner and holder of the note(s) and related security instruments subject to this Agreement, or has full authority to act on behalf of the owner;"),
        indentPara("(b) The note(s) are valid, binding, and enforceable in accordance with their terms;"),
        indentPara("(c) Lender has performed its own due diligence regarding the Loan, the Borrower, and the Property;"),
        indentPara("(d) Lender has full authority and capacity to enter into this Agreement;"),
        indentPara("(e) Lender agrees that all communication regarding the Loan will flow through Servicing Agent while this Agreement is in effect;"),
        indentPara("(f) Lender shall immediately forward to Servicing Agent any payments Lender receives directly from Borrower;"),
        indentPara("(g) Lender shall not direct any proceeds of the Loan to anyone other than Servicing Agent while this Agreement is in effect;"),
        indentPara("(h) Lender assumes responsibility for compliance with applicable lending laws and regulations."),

        sectionBreak(),

        // SECTION 7
        heading("7.0  Release of Liability", HeadingLevel.HEADING_1),

        indentPara("**7.0.1**  Lender hereby releases Servicing Agent and its officers, directors, shareholders, members, managers, employees, contractors, and agents from any and all actions, liabilities, damages, claims, suits, and demands of every kind, nature, and description that Lender may hereafter acquire against Servicing Agent arising out of any acts or omissions of such persons with respect to this Agreement, so long as Servicing Agent has acted in good faith under this Agreement."),
        indentPara("**7.0.2**  It is the intention of Lender that this release shall be effective as a full and final release of each and every matter specifically and generally referred to in this Section."),
        indentPara("**7.0.3**  Furthermore, Lender acknowledges that it: (a) has read this Agreement; (b) understands its terms; (c) has had the opportunity to consult with independent legal counsel; and (d) has signed this Agreement voluntarily."),

        sectionBreak(),

        // SECTION 8
        heading("8.0  Indemnification and Hold Harmless", HeadingLevel.HEADING_1),

        indentPara("**8.0.1**  To the fullest extent permitted by law, Lender agrees to indemnify, defend, protect, and hold harmless Servicing Agent and its officers, directors, members, managers, employees, contractors, and agents from and against any and all costs, losses, liabilities, damages, lawsuits, deficiencies, claims, and expenses, including without limitation interest, penalties, costs, and attorneys\u2019 fees, arising out of or as a result of any of the following:"),
        indentPara("(a) Any actions or omissions of any prior servicer, sub-servicer, owner, or originator of the Loan;"),
        indentPara("(b) Servicing Agent taking any action, or refraining from taking any action, with respect to any Loan at or in conformity with this Agreement or at the direction of Lender;"),
        indentPara("(c) Any breach of the representations, warranties, and covenants made by Lender in this Agreement;"),
        indentPara("(d) Any investigation, inquiry, order, hearing, action, or other proceeding by or before any governmental agency in connection with the Loan;"),
        indentPara("(e) Any claim, demand, or cause of action, whether meritorious or not, brought or asserted against Servicing Agent that directly or indirectly relates to, arises from, or is based on any matters described in this Agreement."),

        indentPara("**8.0.2**  The foregoing indemnification shall not apply to the extent any damages are caused by or result from the gross negligence or willful misconduct of Servicing Agent, its employees, or its agents."),
        indentPara("**8.0.3**  Lender\u2019s obligations under this Section 8.0 shall survive the termination of this Agreement."),

        sectionBreak(),

        // SECTION 9
        heading("9.0  Transfer of Servicing", HeadingLevel.HEADING_1),

        indentPara("**9.0.1**  Upon termination of this Agreement pursuant to Section 2.0, Servicing Agent shall cooperate with the orderly transfer of servicing to Lender or Lender\u2019s designated successor servicer."),
        indentPara("**9.0.2**  Transfer shall be completed within thirty (30) days of the termination effective date."),
        indentPara("**9.0.3**  Servicing Agent shall provide to Lender or successor servicer: (a) all loan files and original documents; (b) complete payment history; (c) Borrower contact information; (d) outstanding balance and accounting; and (e) any other information reasonably necessary to effect the transfer."),
        indentPara("**9.0.4**  Servicing Agent shall deliver a notice to Borrower advising of the transfer of servicing and providing the name, address, and contact information for the new servicer or Lender."),
        indentPara("**9.0.5**  Lender shall be responsible for all costs associated with the transfer of servicing, including any transfer fees as set forth in Exhibit B."),

        sectionBreak(),

        // SECTION 10
        heading("10.0  Confidentiality", HeadingLevel.HEADING_1),

        indentPara("**10.0.1**  The Parties agree to keep certain information confidential (\u201CConfidential Information\u201D). Confidential Information shall include all non-public information or material that has or could have commercial value or other utility in the business in which the Parties are engaged, including but not limited to Borrower information, loan terms, financial data, and business practices."),
        indentPara("**10.0.2**  Neither Party shall, without prior written approval of the other Party, use for its own benefit, publish, copy, or otherwise disclose to others any Confidential Information."),
        indentPara("**10.0.3**  The nondisclosure provisions of this Section shall survive the termination of this Agreement."),

        sectionBreak(),

        // SECTION 11
        heading("11.0  Notice", HeadingLevel.HEADING_1),

        indentPara("**11.0.1**  Lender agrees to promptly notify Servicing Agent in writing within five (5) business days of any change to Lender\u2019s mailing address or contact information."),
        indentPara("**11.0.2**  Any notice required to be provided in this Agreement shall be given in writing and shall be sent: (a) by personal delivery with a record of delivery; (b) by first class certified United States mail, postage prepaid, return receipt requested; (c) by nationally recognized overnight courier service; or (d) via electronic mail to the email addresses set forth in this Agreement."),
        indentPara("**11.0.3**  Lender hereby certifies that the contact information set forth below is true and correct."),

        sectionBreak(),

        // SECTION 12
        heading("12.0  Limitation of Liability", HeadingLevel.HEADING_1),

        indentPara("**12.0.1**  Servicing Agent shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to this Agreement, regardless of whether such damages are based on contract, tort, strict liability, or any other theory."),
        indentPara("**12.0.2**  Servicing Agent\u2019s total aggregate liability to Lender under this Agreement shall not exceed the total servicing fees actually paid by Lender to Servicing Agent in the twelve (12) months immediately preceding the event giving rise to the claim."),
        indentPara("**12.0.3**  Servicing Agent shall not be liable for any losses, damages, or delays caused by events beyond Servicing Agent\u2019s reasonable control, including but not limited to acts of God, natural disasters, government actions, or failure of third-party systems."),

        sectionBreak(),

        // SECTION 13
        heading("13.0  Governing Law and Dispute Resolution", HeadingLevel.HEADING_1),

        indentPara("**13.0.1**  This Agreement shall be governed by and construed in accordance with the laws of the State of _________________."),
        indentPara("**13.0.2**  Any dispute, claim, or controversy arising out of or relating to this Agreement shall first be resolved through good faith negotiation between the Parties for a period of not less than thirty (30) days."),
        indentPara("**13.0.3**  If negotiation fails to resolve the dispute, the Parties agree to submit to mediation before a mutually agreed mediator. If mediation fails, the dispute shall be resolved by binding arbitration in accordance with the rules of the American Arbitration Association."),
        indentPara("**13.0.4**  The prevailing Party in any arbitration or legal proceeding shall be entitled to recover its reasonable attorneys\u2019 fees and costs from the non-prevailing Party."),

        sectionBreak(),

        // SECTION 14
        heading("14.0  General Provisions", HeadingLevel.HEADING_1),

        indentPara("**14.0.1  Severability.**  If any provision of this Agreement shall be invalid or unenforceable, such invalidity shall not invalidate the entire Agreement. The remaining provisions shall be construed and enforced accordingly."),
        indentPara("**14.0.2  Entire Agreement.**  This Agreement, including all exhibits, constitutes the entire agreement between the Parties and supersedes all prior agreements, representations, and understandings."),
        indentPara("**14.0.3  Amendments.**  No modification of this Agreement shall be binding unless made in writing and signed by both Parties."),
        indentPara("**14.0.4  Assignment.**  Neither Party may assign this Agreement without the prior written consent of the other Party."),
        indentPara("**14.0.5  Waiver.**  No waiver of any provision of this Agreement shall be deemed a waiver of any other provision. Failure to enforce any provision shall not constitute a waiver of the right to enforce it."),
        indentPara("**14.0.6  Survival.**  Lender\u2019s obligations under Sections 7.0, 8.0, 10.0, and 12.0 of this Agreement shall survive the termination of this Agreement."),

        sectionBreak(),

        // SECTION 15
        heading("15.0  Portal Access", HeadingLevel.HEADING_1),

        indentPara("**15.0.1**  Upon execution of this Agreement, Lender shall be granted access to the Hickory Street Finance online portal (\u201CPortal\u201D) to view loan status, payment history, Borrower information, and loan documents."),
        indentPara("**15.0.2**  Portal access is for Lender\u2019s use only. Lender shall not share login credentials with any third party."),
        indentPara("**15.0.3**  Servicing Agent reserves the right to suspend or terminate Portal access for security reasons or upon termination of this Agreement."),
        indentPara("**15.0.4**  Servicing Agent makes no warranty that the Portal will be available at all times and shall not be liable for any interruption of Portal access."),

        sectionBreak(),

        // SIGNATURES
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 200 },
          children: [new TextRun({ text: "SIGNATURES", bold: true, font: "Times New Roman", size: 28 })]
        }),

        para("**IN WITNESS WHEREOF**, the Parties hereto have caused this Agreement to be duly executed and shall be deemed effective as of the Effective Date."),

        new Paragraph({ spacing: { before: 300 }, children: [new TextRun({ text: "HICKORY STREET FINANCE LLC", bold: true, font: "Times New Roman", size: 24 })] }),
        ...sigLine("Signature"),
        ...sigLine("Name"),
        ...sigLine("Title"),
        ...sigLine("Date"),

        new Paragraph({ spacing: { before: 500 }, children: [new TextRun({ text: "LENDER", bold: true, font: "Times New Roman", size: 24 })] }),
        ...sigLine("Signature"),
        ...sigLine("Name"),
        ...sigLine("Title / Entity"),
        ...sigLine("Date"),
        ...sigLine("Address"),
        ...sigLine("Email"),
        ...sigLine("Phone"),

        // PAGE BREAK - EXHIBIT A
        new Paragraph({ children: [new PageBreak()] }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          children: [new TextRun({ text: "EXHIBIT A \u2014 LOAN INFORMATION", bold: true, font: "Times New Roman", size: 28 })]
        }),

        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [4000, 5360],
          rows: [
            tableRow("Lender Name"),
            tableRow("Lender Address"),
            tableRow("Lender Email"),
            tableRow("Lender Phone"),
            tableRow("Loan Number"),
            tableRow("Borrower Name"),
            tableRow("Property Address"),
            tableRow("Note Date"),
            tableRow("Original Principal Balance", "$"),
            tableRow("Current Principal Balance", "$"),
            tableRow("Interest Rate", "%"),
            tableRow("Monthly Payment Amount", "$"),
            tableRow("Maturity Date"),
            tableRow("Security Type", "Deed of Trust / Land Contract / Other"),
          ]
        }),

        // PAGE BREAK - EXHIBIT B
        new Paragraph({ children: [new PageBreak()] }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          children: [new TextRun({ text: "EXHIBIT B \u2014 FEE SCHEDULE", bold: true, font: "Times New Roman", size: 28 })]
        }),

        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [6000, 3360],
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  borders, width: { size: 6000, type: WidthType.DXA }, margins: cellMargins,
                  shading: { fill: "2C3E50", type: ShadingType.CLEAR },
                  children: [new Paragraph({ children: [new TextRun({ text: "Service", bold: true, font: "Times New Roman", size: 20, color: "FFFFFF" })] })]
                }),
                new TableCell({
                  borders, width: { size: 3360, type: WidthType.DXA }, margins: cellMargins,
                  shading: { fill: "2C3E50", type: ShadingType.CLEAR },
                  children: [new Paragraph({ children: [new TextRun({ text: "Fee", bold: true, font: "Times New Roman", size: 20, color: "FFFFFF" })] })]
                })
              ]
            }),
            feeRow("Monthly Servicing Fee (per loan)", "$"),
            feeRow("Loan Setup Fee (per loan)", "$"),
            feeRow("Transfer / Termination Fee (per loan)", "$"),
            feeRow("Payoff Processing Fee", "$"),
            feeRow("Late Fee Collection (% of late fees collected)", "%"),
            feeRow("Document Reproduction Fee", "$"),
            feeRow("Additional Services (hourly rate)", "$ /hr"),
          ]
        }),

        new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: "Fees are subject to change with thirty (30) days\u2019 written notice to Lender.", font: "Times New Roman", size: 20, italics: true })] }),

        new Paragraph({ spacing: { before: 400 }, children: [] }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200 },
          border: { top: { style: BorderStyle.SINGLE, size: 1, color: "999999", space: 8 }, bottom: { style: BorderStyle.SINGLE, size: 1, color: "999999", space: 8 } },
          children: [new TextRun({ text: "IMPORTANT: This agreement is a template and should be reviewed by a qualified attorney before use. Hickory Street Finance LLC recommends that all parties seek independent legal counsel prior to execution.", font: "Times New Roman", size: 18, italics: true, bold: true })]
        }),
      ]
    }
  ]
});

const outPath = "C:\\Users\\Richard\\OneDrive\\Desktop\\Village Vist\\Hickory-Street-Finance-Note-Buyer-Servicing-Agreement.docx";
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outPath, buffer);
  console.log("Created: " + outPath);
});
