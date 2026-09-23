from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer,
                                Table, TableStyle, PageBreak, KeepTogether, ListFlowable, ListItem)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

D = "/usr/share/fonts/truetype/dejavu/"
pdfmetrics.registerFont(TTFont("DV", D + "DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DV-B", D + "DejaVuSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("DV-I", D + "DejaVuSans-Oblique.ttf"))
pdfmetrics.registerFont(TTFont("DV-BI", D + "DejaVuSans-BoldOblique.ttf"))
pdfmetrics.registerFontFamily("DV", normal="DV", bold="DV-B", italic="DV-I", boldItalic="DV-BI")

NAVY = colors.HexColor("#1F1B4D")
GOLD = colors.HexColor("#F5B800")
LIGHTGOLD = colors.HexColor("#FFF6D6")
LAV = colors.HexColor("#ECEBF7")
GREY = colors.HexColor("#555555")
LINE = colors.HexColor("#C9C7E0")

W, H = A4
MARGIN = 16 * mm
CW = W - 2 * MARGIN

body = ParagraphStyle("body", fontName="DV", fontSize=8.6, leading=12.4, textColor=colors.black)
cell = ParagraphStyle("cell", parent=body, fontSize=8.1, leading=11.2)
cellb = ParagraphStyle("cellb", parent=cell, fontName="DV-B")
cellh = ParagraphStyle("cellh", parent=cell, fontName="DV-B", textColor=colors.white)
h1s = ParagraphStyle("h1", fontName="DV-B", fontSize=13, leading=16, textColor=colors.white)
h2s = ParagraphStyle("h2", fontName="DV-B", fontSize=10.3, leading=13, textColor=NAVY, spaceBefore=9, spaceAfter=3)
h3s = ParagraphStyle("h3", fontName="DV-B", fontSize=9, leading=12, textColor=colors.HexColor("#3A5FBF"), spaceBefore=5, spaceAfter=2)
tips = ParagraphStyle("tip", parent=body, fontSize=8.2, leading=11.6)
defs = ParagraphStyle("def", parent=body, fontSize=8.6, leading=12.4)
bul = ParagraphStyle("bul", parent=body, leftIndent=0)


def P(t, s=body):
    return Paragraph(t, s)


def part(title):
    t = Table([[P(title, h1s)]], colWidths=[CW])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), NAVY),
        ("LINEBELOW", (0, 0), (-1, -1), 3, GOLD),
        ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return [Spacer(1, 4), t, Spacer(1, 6)]


def h2(t): return P(t, h2s)
def h3(t): return P(t, h3s)


def defbox(label, text):
    t = Table([[P(f"<b>KEY DEFINITION &mdash; {label}</b><br/>{text}", defs)]], colWidths=[CW])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LAV),
        ("LINEBEFORE", (0, 0), (0, -1), 3, NAVY),
        ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return [t, Spacer(1, 5)]


def tip(text, label="MEMORY TIP"):
    t = Table([[P(f"<b>{label}:</b> {text}", tips)]], colWidths=[CW])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHTGOLD),
        ("LINEBEFORE", (0, 0), (0, -1), 3, GOLD),
        ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return [t, Spacer(1, 5)]


def bullets(items, numbered=False, style=body):
    lf = ListFlowable(
        [ListItem(P(i, style), leftIndent=14) for i in items],
        bulletType="1" if numbered else "bullet",
        start=None if numbered else "\u2022",
        bulletFontName="DV-B", bulletFontSize=8.4, leftIndent=14,
        bulletColor=NAVY,
    )
    return [lf, Spacer(1, 4)]


def table(header, rows, widths, bold_first=True):
    data = [[P(h, cellh) for h in header]]
    for r in rows:
        data.append([P(c, cellb if (i == 0 and bold_first) else cell) for i, c in enumerate(r)])
    tot = sum(widths)
    cw = [w / tot * CW for w in widths]
    t = Table(data, colWidths=cw, repeatRows=1)
    st = [
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("GRID", (0, 0), (-1, -1), 0.5, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5), ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 3.5), ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
    ]
    for i in range(1, len(data)):
        if i % 2 == 0:
            st.append(("BACKGROUND", (0, i), (-1, i), colors.HexColor("#F6F5FC")))
    t.setStyle(TableStyle(st))
    return [t, Spacer(1, 6)]


def on_page(c, doc):
    c.saveState()
    c.setFillColor(NAVY)
    c.rect(0, H - 9 * mm, W, 9 * mm, stroke=0, fill=1)
    c.setFillColor(GOLD)
    c.rect(0, H - 10.2 * mm, W, 1.2 * mm, stroke=0, fill=1)
    c.setFillColor(colors.white)
    c.setFont("DV-B", 7.5)
    c.drawString(MARGIN, H - 6.2 * mm, "IT 415  |  Elective 4 (ISDM)  |  Prelim Reviewer")
    c.setFillColor(GREY)
    c.setFont("DV", 7.5)
    c.drawCentredString(W / 2, 8 * mm, f"Page {doc.page}")
    c.restoreState()


doc = BaseDocTemplate("/mnt/user-data/outputs/IT415_Prelim_Reviewer.pdf", pagesize=A4,
                      leftMargin=MARGIN, rightMargin=MARGIN, topMargin=17 * mm, bottomMargin=15 * mm,
                      title="IT 415 Prelim Reviewer", author="Reviewer")
doc.addPageTemplates([PageTemplate(id="p", frames=[Frame(MARGIN, 15 * mm, CW, H - 32 * mm, id="f",
                      leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)], onPage=on_page)])

S = []

# ---------------- TITLE ----------------
tb = Table([[P("IT 415 &mdash; Elective 4", ParagraphStyle("t1", fontName="DV-B", fontSize=9, textColor=GOLD, leading=12))],
            [P("Information System Development and Management", ParagraphStyle("t2", fontName="DV-B", fontSize=15, textColor=colors.white, leading=19))],
            [P("PRELIM REVIEWER", ParagraphStyle("t3", fontName="DV-B", fontSize=22, textColor=colors.white, leading=27))],
            [P("Coverage: Week 1 (Intro to ISDM) &nbsp;|&nbsp; Origins of Software &nbsp;|&nbsp; Week 2 (SDLC &amp; Software Process) &nbsp;|&nbsp; Week 3 (Agile Development) &nbsp;|&nbsp; Weeks 4&ndash;5 (Managing IS Projects) &nbsp;|&nbsp; Week 6 (Identifying &amp; Selecting Projects)",
               ParagraphStyle("t4", fontName="DV", fontSize=8.3, textColor=colors.HexColor("#E3E1F5"), leading=12))]],
           colWidths=[CW])
tb.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), NAVY), ("LINEBELOW", (0, -1), (-1, -1), 4, GOLD),
                        ("LEFTPADDING", (0, 0), (-1, -1), 12), ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                        ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                        ("TOPPADDING", (0, 0), (-1, 0), 10), ("BOTTOMPADDING", (0, -1), (-1, -1), 10)]))
S += [tb, Spacer(1, 8)]
S += tip("Definitions are boxed in blue. Numbered lists (enumerations) are the likely exam items, so memorize them in order. "
         "A master list of every enumeration is at the end.", "HOW TO USE")

# ============ PART 1 ============
S += part("PART 1: INTRODUCTION TO INFORMATION SYSTEMS DEVELOPMENT AND MANAGEMENT (Week 1)")
S += defbox("Information System", "A set of components that work together to <b>collect, process, store, and share information</b>. "
            "This usually guides decision-making to improve <b>efficiency and profitability</b>.")

S.append(h2("Enumeration: 6 Components of an Information System"))
S += table(["#", "Component", "Key Detail"], [
    ["1", "Hardware", "Physical devices (computer, monitor, keyboard, router)"],
    ["2", "Software", "Programs that run on the hardware"],
    ["3", "Data Sources", "Databases, servers, files/folders"],
    ["4", "Telecommunications", "Networks/towers that transmit data"],
    ["5", "Process", "The workflow/cycle of operations"],
    ["6", "Human Expertise", "Humans empathize, interpret emotions, and cater to user experience; vital for designing user-centric IT solutions"],
], [0.5, 2.2, 7])
S += tip("<b>H-S-D-T-P-H</b> &rarr; Hardware, Software, Data, Telecom, Process, Human.")

S.append(h2("Key Terms: IS Analysis and Design"))
S += table(["Term", "Definition"], [
    ["Information Systems Analysis and Design", "The process teams follow to <b>create or improve</b> an information system. Involves studying the organization's needs, identifying problems, and designing solutions."],
    ["Application Software", "An important result of IS analysis and design; software designed to support a <b>specific organizational function or process</b>."],
    ["System Analyst", "Main role: the <b>bridge between the business side and the technical side</b>."],
    ["System Development Methodology", "A standard process followed in an organization to conduct <b>all steps necessary to analyze, design, implement, and maintain</b> information systems."],
], [2.6, 7])

S.append(h2("SDLC: Systems Development Life Cycle"))
S += defbox("SDLC", "A common methodology for systems development in many organizations; it features <b>several phases that mark the progress</b> of the systems analysis and design effort.")
S.append(h3("Enumeration: 5 Phases of SDLC (cyclical)"))
S += table(["#", "Phase", "Products / Output Deliverables"], [
    ["1", "Planning", "Priorities for systems and projects; architecture for data, networks, hardware, and IS management; project scope specification; assignment of team members and resources; system justification / business case"],
    ["2", "Analysis", "Description of the current system and where problems or opportunities exist, with a general recommendation to fix, enhance, or replace it; explanation of alternative systems and justification for the chosen alternative"],
    ["3", "Design", "<b>Functional</b> detailed specs of all system elements (data, processes, inputs, outputs); <b>technical</b> detailed specs (programs, files, network, system software); acquisition plan for new technology"],
    ["4", "Implementation", "Code, documentation, training procedures, and support capabilities"],
    ["5", "Maintenance", "New versions or releases of software with associated updates to documentation, training, and support"],
], [0.5, 2, 8])
S += tip("Planning &rarr; Analysis &rarr; Design &rarr; Implementation &rarr; Maintenance &rarr; back to Planning. It is a <b>cycle</b>.", "FLOW")

S.append(h2("Software Engineering"))
S += defbox("Software Engineering", "Encompasses <b>process, methods, and tools</b> that enable complex computer-based systems to be built <b>in a timely manner with quality</b>.")
S.append(h3("Enumeration: Software Process &mdash; 5 Framework Activities"))
S += bullets(["<b>Communication</b>", "<b>Planning</b>", "<b>Modeling</b>", "<b>Construction</b>", "<b>Deployment</b>"], numbered=True)
S.append(h3("Enumeration: Software Engineering Layers (foundation to top)"))
S += bullets(["<b>A Quality Focus</b> (foundation)", "<b>Process</b>", "<b>Methods</b>", "<b>Tools</b> (topmost)"], numbered=True)
S.append(h3("Enumeration: Software Engineering Practices"))
S += bullets(["<b>Understand the problem</b>", "<b>Plan a solution</b>", "<b>Carry out the plan</b>", "<b>Examine the result for accuracy</b>"], numbered=True)

S.append(h2("Project Management"))
S += defbox("Project Management", "The practice of <b>planning, organizing, and overseeing the execution</b> of a project from start to finish.")
S += bullets([
    "Involves defining project goals, identifying tasks and resources required, setting timelines, and monitoring progress.",
    "Goal: project completed <b>on time, within budget, and to stakeholders' satisfaction</b>.",
    "Involves processes such as <b>risk management, stakeholder management, and communication management</b>.",
    "Essential in software development, construction, marketing, and many other fields.",
])

# ============ PART 2 ============
S += part("PART 2: ORIGINS OF SOFTWARE")
S.append(h2("Enumeration: 4 Eras (chronological)"))
S += table(["#", "Era", "Period"], [
    ["1", "Early Days", "1940s&ndash;1950s"],
    ["2", "The Birth of High-Level Languages", "1950s&ndash;1960s"],
    ["3", "Software Industry Emerges", "1970s&ndash;1980s"],
    ["4", "Modern Software Era", "1990s&ndash;Today"],
], [0.5, 5, 3])

S.append(h3("Era 1: Early Days (1940s&ndash;1950s)"))
S += bullets([
    "Computers were huge, expensive, and programmed using <b>machine language</b> (binary 1s and 0s).",
    "<b>Assembly language</b> later made it slightly easier by using short codes instead of pure binary.",
    "Software was often <b>bundled with hardware</b>.",
])
S += table(["Machine", "Full Name", "Identification Clues"], [
    ["ENIAC", "Electronic Numerical Integrator and Computer", "The <b>first general-purpose electronic digital computer</b>. Developed during <b>World War II</b> by the U.S. military to calculate <b>artillery firing tables</b>."],
    ["UNIVAC", "Universal Automatic Computer", "Pioneering line of electronic digital computers developed in the U.S. The <b>first commercial computers</b> designed for business and general-purpose use."],
], [1.3, 2.7, 6])

S.append(h3("Era 2: The Birth of High-Level Languages (1950s&ndash;1960s)"))
S += table(["Language", "Full Name", "Identification Clues"], [
    ["FORTRAN", "FORmula TRANslation", "High-level language for <b>scientific and numerical computing</b>. Known for performance; still used in scientific and engineering fields today."],
    ["COBOL", "Common Business-Oriented Language", "High-level language for <b>business, finance, and administrative systems</b>. One of the first <b>standardized</b> languages; still used in many <b>legacy systems</b> (finance, government)."],
], [1.3, 2.7, 6])
S += tip("FORTRAN = &ldquo;Formula&rdquo; &rarr; math/science. COBOL = &ldquo;Business-Oriented&rdquo; &rarr; business/finance.")

S.append(h3("Era 3: Software Industry Emerges (1970s&ndash;1980s)"))
S += table(["Term / Item", "Definition / Clues"], [
    ["Personal Computer", "A digital computer designed for <b>individual use</b> (word processing, internet browsing, gaming, multimedia playback)."],
    ["Operating System", "Essential system software that <b>manages a computer's hardware and software resources</b>, providing common services for programs."],
    ["Apple II / IBM PC", "Examples of early personal computers."],
    ["MS-DOS", "<b>Microsoft Disk Operating System</b>. Example of an early operating system."],
    ["VisiCalc (Visible Calculator)", "The <b>first spreadsheet program</b>; the <b>&ldquo;killer application&rdquo; for the Apple II</b>, helping popularize personal computers for business use."],
], [2.5, 7.5])

S.append(h3("Era 4: Modern Software Era (1990s&ndash;Today)"))
S += bullets([
    "<b>GUI</b> (Graphical User Interface) replaced text-only screens.",
    "<b>CLI</b> (Command Line Interface): text-based interface, contrasted with GUI.",
    "Rise of <b>Internet-based software</b>.",
    "<b>Mobile apps and AI-powered tools</b> dominate today's software landscape.",
])

# ============ PART 3 ============
S += part("PART 3: SYSTEM DEVELOPMENT LIFE CYCLE AND SOFTWARE PROCESS (Week 2)")
S.append(P("<b>Learning objectives:</b> software processes and process models; fundamental process activities (requirements engineering, development, testing, evolution); software process improvement and factors affecting process quality."))
S.append(Spacer(1, 4))

S += defbox("SDLC (Week 2 definition)", "A <b>phased approach to analysis and design</b> that holds that systems are best developed through the use of a <b>specific cycle of analyst and user activities</b>.")
S += bullets([
    "The 5 phases: Planning, Analysis, Design, Implementation, Maintenance (see Part 1).",
    "<b>The heart of the systems development process</b> = the <b>Analysis &rarr; Design &rarr; Code &rarr; Test loop</b>.",
])

S += defbox("Software Process", "The set of <b>related activities and associated outcomes</b> that produce a software product.")
S.append(h3("Enumeration: 4 Fundamental Process Activities"))
S += table(["#", "Activity", "Meaning"], [
    ["1", "Software specification", "The functionality of the software and constraints on its operation must be <b>defined</b>."],
    ["2", "Software development", "The software to meet the requirements and specification must be <b>produced</b>."],
    ["3", "Software validation", "The software must be validated to ensure it <b>does what the customer wants</b>."],
    ["4", "Software evolution", "The software must evolve to meet <b>changing customer/client needs</b>."],
], [0.5, 2.6, 7])

S += defbox("Software Process Model", "A <b>specified definition of a software process</b>, presented from a particular perspective and thus only providing <b>partial information</b> about that process.")
S += bullets([
    "Generic models are <b>high-level, abstract descriptions</b> of software processes used to explain different approaches to software development.",
    "They give team members a <b>common language and understanding</b>, promoting collaboration and communication.",
])

S.append(h3("Different Types of Software Process Models"))
S += table(["Model", "Description", "Best For"], [
    ["Waterfall Model", "<b>Linear, sequential</b> approach that progresses strictly <b>top-down</b>. Each phase must be <b>completed before the next</b>. Phases: Requirements &rarr; Analysis &amp; Design &rarr; Implementation &rarr; Verification &rarr; Deployment &rarr; Maintenance.", "Projects with <b>well-defined and stable requirements</b>"],
    ["Agile Model", "Emphasizes <b>flexibility and adaptive planning</b>. Promotes iterative development; delivers working software in <b>frequent, short iterations</b>.", "Projects with <b>changing requirements</b> and need for quick response to customer feedback"],
    ["Iterative Model", "Focuses on <b>incremental development</b>; each iteration produces a <b>working software component</b>. Allows early prototyping and testing, enabling feedback-driven improvements.", "Feedback-driven improvement throughout development"],
], [1.8, 5.5, 3])

S.append(h3("Benefits of Using Software Process Models"))
S += bullets([
    "<b>Efficiency in Software Development:</b> structured approach; streamlines workflows; minimizes risk of missed deadlines or overlapping tasks.",
    "<b>Quality Assurance and Risk Management:</b> ensures software is thoroughly tested before deployment by defining specific checkpoints and validation processes.",
], numbered=True)

S.append(h3("Enumeration: Factors in Choosing the Right Process Model"))
S += bullets(["Project size and complexity", "Stability of requirements", "Customer involvement and feedback", "Team size and expertise", "Schedule and time constraints"], numbered=True)

S.append(h2("McCall's Software Quality Factors"))
S.append(P("Three categories (the triangle): <b>Product Operation</b>, <b>Product Revision</b>, <b>Product Transition</b>. Total of 11 factors."))
S.append(Spacer(1, 4))
S.append(h3("Product Operation (5): how the software runs"))
S += table(["Factor", "Meaning"], [
    ["Correctness", "Accuracy, completeness, timeliness, and availability of the software's output; adherence to coding and documentation standards."],
    ["Reliability", "Minimizing service failures by determining the <b>maximum allowed failure rate</b> for the software or its functions."],
    ["Efficiency", "Hardware resources required (processing power, storage, data communication) and time between recharging portable units."],
    ["Integrity", "<b>Security</b> of the system; access restricted to <b>authorized users</b> with appropriate permissions."],
    ["Usability", "Ease with which <b>new staff can be trained</b> to use and operate the software."],
], [1.8, 8.5])
S.append(h3("Product Revision (3): how easily it can be changed"))
S += table(["Factor", "Meaning"], [
    ["Maintainability", "Effort required to <b>identify, fix, and verify</b> software failures by users and maintenance personnel."],
    ["Flexibility", "Ability to adapt to new situations and users <b>without requiring changes to the software itself</b>."],
    ["Testability", "Ease of testing: predefined results, log files, and automatic diagnostics to check all components and report issues."],
], [1.8, 8.5])
S.append(h3("Product Transition (3): how easily it moves to new environments"))
S += table(["Factor", "Meaning"], [
    ["Portability", "Software can be adapted to <b>different environments</b> (hardware or operating systems)."],
    ["Reusability", "Designing modules that can be <b>reused in future projects</b>, saving time/resources and improving module quality."],
    ["Interoperability", "Interfaces that let the software <b>work seamlessly with other software systems or equipment firmware</b>."],
], [1.8, 8.5])
S += tip("<b>Operation</b> = Correctness, Reliability, Efficiency, Integrity, Usability (&ldquo;CREIU&rdquo;). <b>Revision</b> = Maintainability, Flexibility, Testability (&ldquo;MFT&rdquo;). <b>Transition</b> = Portability, Reusability, Interoperability (&ldquo;PRI&rdquo;).")

# ============ PART 4 ============
S += part("PART 4: AGILE DEVELOPMENT (Week 3)")
S.append(P("<b>Learning objectives:</b> rationale for agile methods, the agile manifesto, and agile vs. plan-driven; agile practices, frameworks, and principles; issues of scaling agile and combining it with plan-driven approaches."))
S.append(Spacer(1, 4))

S += defbox("Plan-Driven Software Development", "A process that <b>completely specifies the requirements</b> and then designs, builds, and tests a system.")
S += defbox("Agile Development", "Agile methods are designed to <b>produce useful software quickly</b>. They are <b>incremental</b> development methods in which the increments are small and new releases are typically made available to customers <b>every two or three weeks</b>.")

S.append(h2("Plan-Driven vs. Agile Approach"))
S += table(["", "Plan-Driven", "Agile"], [
    ["Stages", "Identifies <b>separate stages</b> with <b>outputs associated with each stage</b>", "Considers <b>design and implementation the central activities</b>; folds requirements elicitation and testing into them"],
    ["Iteration", "Occurs <b>within</b> activities", "Occurs <b>across</b> activities"],
    ["Communication", "<b>Formal documents</b> communicate between stages", "Requirements and design are <b>developed together</b>, not separately"],
    ["Example", "Requirements evolve until a requirements specification is produced, as input to design and implementation", "&mdash;"],
], [1.5, 4.5, 4.5])

S.append(h2("Enumeration: 5 Common Practices of Agile Development"))
S += table(["#", "Practice", "Meaning"], [
    ["1", "Customer Collaboration", "Continuous involvement of the customer to ensure the product meets their needs"],
    ["2", "Iterative Development", "Small, frequent increments; working software early and often"],
    ["3", "Flexibility", "Ability to respond to changing requirements, even late in development"],
    ["4", "Self-organizing Teams", "Teams have autonomy to organize their work and decide how to achieve goals"],
    ["5", "Continuous Improvement", "Regular reflection on processes and practices to improve efficiency and quality"],
], [0.5, 2.8, 7])

S.append(h2("Key Agile Methodologies / Frameworks"))
S += tip("Frameworks covered: <b>Kanban, Scrum, XP, APF, XPM, ASD, DSDM, FDD</b>.", "LIST")

S.append(h3("1. Kanban"))
S += bullets([
    "A <b>visual</b> agile approach: teams use a <b>board</b> to track tasks through stages of development.",
    "<b>Tasks = cards</b>; <b>columns = stages</b>. Cards are moved between columns as work progresses.",
    "Example board columns: Backlog, Up Next, In Progress, On Hold, Done. Example tool: Trello.",
])

S.append(h3("2. Scrum (most popular framework to regularly ship releases)"))
S += bullets([
    "Developed in the <b>1990s</b> by <b>Ken Schwaber and Jeff Sutherland</b>.",
    "Agile methodology for <b>small teams</b> that involves <b>sprints</b>; led by a Scrum master; team meets <b>daily</b> to discuss tasks and roadblocks.",
    "<b>Ideal for</b> complex, long-term projects with evolving requirements and uncertain release dates. Used by Microsoft, IBM, Yahoo, and Google.",
])
S.append(P("<b>Enumeration: 3 Scrum Roles</b>"))
S += table(["Role", "Responsibility"], [
    ["Scrum Master", "<b>Removes obstacles</b> to ensure team efficiency"],
    ["Product Owner", "<b>Represents the customer</b>, sets priorities, and provides feedback"],
    ["Development Team", "<b>Cross-functional, self-organized</b> team that delivers product increments"],
], [2.2, 8])
S.append(P("<b>Sprints and Artifacts</b>"))
S += table(["Item", "Meaning"], [
    ["Sprint", "Short, <b>fixed-length</b> development cycle (<b>1&ndash;4 weeks</b>) producing incremental product updates"],
    ["Product Backlog", "<b>Prioritized list of requirements</b> maintained by the Product Owner"],
    ["Sprint Backlog", "List of tasks for the <b>current</b> Sprint"],
    ["Sprint Burndown Chart", "Tracks progress by showing <b>remaining work</b>"],
], [2.2, 8])
S.append(P("<b>Enumeration: 4 Scrum Meetings</b> (time-box shown for a one-month Sprint)"))
S += table(["Meeting", "Purpose", "Time-box"], [
    ["Daily Scrum", "Team coordination", "<b>15 minutes</b> daily"],
    ["Sprint Planning", "Plan the Sprint's work; outline goals for each sprint", "Up to <b>8 hours</b>"],
    ["Sprint Review", "Review completed work", "<b>4 hours</b>"],
    ["Sprint Retrospective", "Discuss what went well and areas for improvement", "<b>3 hours</b>"],
], [2.3, 5, 2.2])
S += tip("Time-box order: Planning 8 &rarr; Review 4 &rarr; Retrospective 3 (decreasing). Daily Scrum is always 15 minutes.")

S.append(h3("3. Extreme Programming (XP)"))
S += bullets([
    "Agile framework focused on <b>high-quality code and technical excellence</b>; emphasizes rigorous engineering practices to adapt quickly to changing requirements.",
    "Similar to Scrum (regular releases and iterations) but with a <b>stronger technical emphasis</b>: <i>how</i> tasks are accomplished.",
    "Suitable for <b>small teams (up to 12 people)</b> with tight deadlines. Can be used independently or in a <b>hybrid with Scrum</b> (XP's technical practices + Scrum's management approach).",
])
S.append(P("<b>Enumeration: 5 Core Values of XP</b>"))
S += bullets(["<b>Communication</b>", "<b>Simplicity</b>", "<b>Feedback</b>", "<b>Courage</b>", "<b>Respect</b>"], numbered=True)
S.append(P("<b>Enumeration: 5 Key XP Practices</b>"))
S += table(["#", "Practice", "Meaning"], [
    ["1", "Test-Driven Development (TDD)", "Writing tests <b>before</b> code; improves quality through the <b>Red-Green-Refactor</b> cycle"],
    ["2", "Code Refactoring", "Continuously improving code by simplifying and clarifying it <b>without altering functionality</b>"],
    ["3", "Continuous Integration (CI)", "Frequently integrating code changes; CI/CD tools ensure rapid delivery and a clean codebase"],
    ["4", "Pair Programming", "<b>Two developers</b> together, one coding and one reviewing; enhances design and shares knowledge"],
    ["5", "Coding Standards", "Standardized code formats and styles for consistency and maintainability"],
], [0.5, 3, 7])

S.append(h3("4. Adaptive Project Framework (APF)"))
S += bullets([
    "Designed for <b>IT projects where unexpected changes can occur</b>.",
    "Acknowledges that resources (budgets, timelines, team members) may change during a project.",
    "Focuses on managing the resources <b>currently available</b>, rather than those initially planned.",
    "Cycle: Project Planning &rarr; Cycle Planning &rarr; Task Initiation &rarr; Client Feedback &rarr; Final Output (repeat as necessary).",
])
S.append(h3("5. Extreme Project Management (XPM)"))
S += bullets([
    "Ideal for <b>complex projects with high uncertainty</b>.",
    "Continuously adapts processes and strategies, often <b>shifting week to week</b>, until the desired outcome is achieved.",
    "Requires <b>high flexibility</b>: short sprints, frequent changes, <b>trial-and-error</b> problem solving, and multiple iterations for self-correction.",
])
S.append(h3("6. Adaptive Software Development (ASD)"))
S += bullets([
    "Focused on <b>continuous adaptation</b>; three <b>overlapping</b> phases: <b>Speculate, Collaborate, Learn</b>.",
    "Teams often operate in all three phases <b>simultaneously</b>, enabling continuous learning and problem-solving.",
    "<b>Non-linear</b> structure and repetition enable quicker issue identification and resolution than standard project management methods.",
])
S.append(h3("7. Dynamic Systems Development Method (DSDM)"))
S += bullets([
    "Agile method emphasizing a <b>full project lifecycle</b> with a <b>more structured approach</b>.",
    "<b>Enumeration: 4 phases</b> &mdash; (1) Feasibility and Business Study, (2) Functional Model or Prototype Iteration, (3) Design and Build Iteration, (4) Implementation.",
], )
S.append(h3("8. Feature Driven Development (FDD)"))
S += bullets([
    "Combines agile best practices with a <b>focus on specific software features</b>.",
    "Relies heavily on <b>customer input</b> to prioritize features; allows frequent updates and quick error fixing.",
    "Process: (1) Develop an overall model, (2) Build a features list, (3) Plan by feature, (4) Design by feature, (5) Build by feature.",
])

S.append(h2("Enumeration: The 12 Principles of Agile Methods"))
S += table(["#", "Principle", "Meaning"], [
    ["1", "Satisfy Customers Early and Often", "Regular updates lead to satisfied customers and recurring revenue"],
    ["2", "Embrace Changing Requirements", "Flexibility helps accommodate late changes"],
    ["3", "Deliver Value Frequently", "Frequent delivery helps retain customers and stakeholders"],
    ["4", "Promote Collaboration", "Break down silos; encourage frequent team collaboration"],
    ["5", "Build Around Motivated Individuals", "Agile thrives with committed, engaged members"],
    ["6", "Face-to-Face Communication", "Preferred for effective communication, even if virtual"],
    ["7", "Prioritize Working Software", "Functional software is the primary measure of progress"],
    ["8", "Maintain a Sustainable Pace", "Manageable pace avoids team burnout"],
    ["9", "Continuous Excellence", "Build on excellent work to enhance future agility"],
    ["10", "Keep It Simple", "Opt for the simplest solutions to complex problems"],
    ["11", "Foster Self-Organizing Teams", "Empower teams to organize themselves for maximum value"],
    ["12", "Reflect and Adjust", "Regular retrospectives improve effectiveness and adapt practices"],
], [0.5, 3.6, 6.4])

S.append(h2("Issues of Scaling Agile Development"))
S += table(["Issue", "Challenge", "Impact"], [
    ["Coordination Across Teams", "Practices like Scrum or XP are designed for <b>small, co-located teams</b>; scaling needs effective coordination and communication", "Misalignment between teams &rarr; integration issues and inconsistencies"],
    ["Maintaining Agile Principles", "As teams grow, keeping flexibility and rapid iteration becomes harder", "Large projects become <b>less agile and more rigid</b>"],
    ["Complexity in Communication", "More teams &rarr; harder to keep all teams aligned and informed", "Increased risk of miscommunication and delays in decision-making"],
    ["Consistency in Practices", "Hard to ensure consistent agile practices and standards across multiple teams", "Fragmented processes and reduced overall efficiency"],
    ["Scaling Frameworks", "Implementing <b>SAFe (Scaled Agile Framework), LeSS (Large Scale Scrum), or the Spotify model</b> is complex and needs careful adaptation", "Poor implementation &rarr; confusion and resistance from teams"],
], [2.3, 4.7, 3.5])

S.append(h2("Issues in Combining Agile with Plan-Driven Approaches"))
S += table(["Issue", "Challenge", "Impact"], [
    ["Conflicting Cultures", "Agile: flexibility and iteration. Plan-driven: detailed upfront planning and documentation", "Friction between teams and management"],
    ["Integration of Processes", "Agile's iterative cycles vs. plan-driven structured phases", "Mismatched processes and workflows; inefficiencies and delays"],
    ["Documentation vs. Flexibility", "Agile minimizes documentation; plan-driven requires comprehensive documentation", "Hard to balance documentation with a focus on working software"],
    ["Resource Allocation", "Agile needs adaptive resource management; plan-driven relies on <b>fixed resource plans</b>", "Delays and resource conflicts"],
    ["Change Management", "Agile welcomes change; plan-driven may resist change once the plan is set", "Resistance to change; difficulty adapting to new requirements"],
], [2.3, 4.7, 3.5])

# ============ PART 5 ============
S += part("PART 5: MANAGING INFORMATION SYSTEMS PROJECTS (Weeks 4&ndash;5)")
S.append(P("<b>Learning objectives:</b> the process of managing an IS project (initiation, planning, execution, closedown); applying Gantt charts and network diagrams in project schedules; commercial project management software for representing and managing schedules."))
S.append(Spacer(1, 4))

S += defbox("Management Information System (MIS)", "A discipline that <b>combines business and computing</b> to help organizations digitize work and manage an increasingly remote workforce; a <b>planned system of collecting, storing, and disseminating data</b> as information needed to carry out the functions of management; an implementation of the organizational systems and procedures.")

S.append(h2("Enumeration: 5 Phases of Project Management (PMBOK / PMI)"))
S.append(P("According to the <b>PMBOK Guide (Project Management Body of Knowledge)</b> by the <b>Project Management Institute (PMI)</b>, the life cycle turns a project idea into a working product."))
S.append(Spacer(1, 4))
S += table(["#", "Phase", "Key Points"], [
    ["1", "Initiation", "First step in turning an idea into a tangible goal by developing a <b>business case</b> and defining the project broadly. Create the <b>project charter</b> (constraints, goals, budget, timeline; <b>appoints the project manager</b>). Identify key stakeholders and create a <b>stakeholder register</b>. Technical details are reserved for planning. (Example: for an electric vehicle, no design choices yet, only commitment to develop it within the timeframe and budget.)"],
    ["2", "Planning", "Establishes the project's <b>roadmap</b>; often takes nearly half the project timespan unless Agile. Identify technical requirements; create detailed <b>project schedule</b> and <b>communication plan</b>; set goals with <b>S.M.A.R.T.</b> and <b>C.L.E.A.R.</b>; define <b>scope</b> (changes need project manager approval); develop <b>Work Breakdown Structure (WBS)</b>; set timeline with deliverables; plan risk mitigation and change management to prevent <b>scope creep</b> and delays; set budget baseline; define roles and responsibilities."],
    ["3", "Execution", "Team carries out the project work; the project manager <b>establishes workflows and monitors progress</b> and maintains collaboration among stakeholders. Allocate and manage resources, build the product, meet often and fix issues. Collaboration and brainstorming tools boost efficiency."],
    ["4", "Monitoring and Controlling", "Occurs <b>alongside execution</b> to ensure objectives and deliverables are met. Prevent deviations by establishing <b>Critical Success Factors (CSF)</b> and <b>Key Performance Indicators (KPI)</b>. Track <b>effort and cost</b> to stay within budget; ensure adherence to plan; prevent disruptions; provide data for future projects."],
    ["5", "Closure (Closing)", "Marks the end of the project <b>after final delivery</b>. Project manager <b>terminates contracts, completes paperwork, conducts a reflection meeting</b> on successes and failures; compiles a detailed final report; data securely stored. Hand over and review deliverables, get results approved, document learnings."],
], [0.5, 2, 8.5])
S += tip("The learning objectives list <b>four</b> phases (initiation, planning, execution, closedown), but the lecture teaches <b>five</b> (adds Monitoring and Controlling). Memorize all five and note the four-phase version too.", "NOTE")

S.append(h2("Goal-Setting Methods"))
S.append(h3("S.M.A.R.T. Goals"))
S += bullets([
    "Ensures project goals are <b>critically analyzed</b>; an established method that <b>reduces risk</b> and helps project managers make clearly defined, achievable goals.",
    "<b>S</b>pecific, <b>M</b>easurable, <b>A</b>ttainable, <b>R</b>ealistic, <b>T</b>imely.",
])
S.append(h3("C.L.E.A.R. Goals"))
S += bullets([
    "Designed for the <b>dynamic nature of the modern workplace</b>, which requires flexibility and immediate results; can help <b>citizen developers</b>.",
    "<b>C</b>ollaborative, <b>L</b>imited, <b>E</b>motional, <b>A</b>ppreciable, <b>R</b>efinable.",
])

S.append(h2("Scheduling Tools"))
S += table(["Tool", "Key Facts"], [
    ["Gantt Chart", "Visually represents <b>project schedules on a timeline</b>. Split into two halves: <b>tasks listed on the left</b> (spreadsheet-style) and <b>timeline on the right</b> for a quick view of the whole schedule. Used in <b>planning</b> to create the schedule and throughout <b>execution</b> to track task progress until completed."],
    ["Network Diagram", "A schematic showing <b>all tasks in a project, who is responsible, and the flow of work</b> needed to complete them (visualizes the schedule). Provides a <b>high-level overview</b> for presenting to executives or investors. Also ideal for mapping any task sequence, such as operational workflows and business processes."],
], [2, 8.5])

S.append(h2("Best Free Project Management Software"))
S += table(["Software", "Best For", "Standout Feature", "Free Plan"], [
    ["Trello", "Visually managing projects", "Customizable Kanban boards with unlimited Power-Ups", "Unlimited cards and members"],
    ["Asana", "Teams", "Flexible PM methodologies", "Unlimited projects/tasks, up to 15 users"],
    ["ClickUp", "Customized task views", "11 task views and 4 page views", "Unlimited tasks and users"],
    ["Wrike", "Spreadsheet-like features", "Best-in-class project tracking", "Unlimited projects and users"],
    ["ActiveCollab", "Freelancers and small agency teams", "Built-in time tracking, billing, expenses", "Unlimited projects/tasks, up to 3 members"],
    ["Airtable", "Building a customized app", "Most customizable app with lots of templates", "Unlimited bases at 1,000 records per base, up to 5 users"],
    ["Jira", "Agile software development teams", "Purpose-built for developers and engineers", "Unlimited projects on 1 site, up to 10 users"],
    ["Height", "AI features", "AI creates subtasks, suggests improvements, detects duplicate tasks", "Unlimited tasks and users"],
], [1.4, 2.4, 3.4, 3.2])

# ============ PART 6 ============
S += part("PART 6: IDENTIFYING AND SELECTING SYSTEMS DEVELOPMENT PROJECTS (Week 6)")
S.append(P("<b>Learning objectives:</b> project identification and selection process; corporate strategic planning and information systems planning; the three classes of internet e-commerce (B2B, B2C, C2C)."))
S.append(Spacer(1, 4))

S += defbox("Systems Development Project (SDP)", "The process of <b>defining, designing, testing, and implementing</b> a new software application or program. An <b>iterative</b> process involving code design, implementation, testing, and deployment of software components or objects; also includes analyzing tests, training users, system migration, and the operational process.")
S += defbox("Project", "A <b>sequence of tasks</b> that must be completed to attain a certain outcome. Per the PMI: &ldquo;any <b>temporary endeavor with a definite beginning and end</b>.&rdquo; Can be managed by a single person or hundreds. Proposed by an individual who identifies a <b>project-worthy need or opportunity</b>.")

S.append(h2("Project Identification"))
S += defbox("Project Identification", "The process of <b>brainstorming, analyzing, and selecting</b> a project to initiate, as a <b>preliminary step before the first phase</b> of the project life cycle. The proposal generally contains a <b>final goal, cost and time estimates, and a list of tasks and activities</b>. The identification phase evaluates and decides whether a proposed project should be undertaken based on factors like <b>costs, benefits, and risks</b>.")
S.append(h3("Enumeration: 7 Steps to Conduct Project Identification"))
S += table(["#", "Step", "Key Point"], [
    ["1", "Brainstorm ideas for your next project", "Starts as soon as identification does; include as many team members as possible"],
    ["2", "Initiate your project", "Outline general activities, milestones, and goals before sharing with teammates"],
    ["3", "Perform feasibility and viability studies", "Ensure the project is doable; activities lead to the ultimate goal; current staff can handle responsibilities"],
    ["4", "Complete the project schedule", "A roadmap for resource allocation and the tasks to be completed"],
    ["5", "Perform a project risk analysis", "Methods: (a) Qualitative risk analysis, (b) Quantitative risk analysis, (c) SWOT analysis, (d) Root cause analysis (RCA), (e) Failure Mode Engineering Analysis (FMEA)"],
    ["6", "Estimate resources", "Double-check cost, workforce, and material estimates for validity"],
    ["7", "Submit for approval", "Submit the final proposal and get approval of key project stakeholders"],
], [0.5, 3.6, 6.4])

S.append(h2("Project Selection"))
S += defbox("Project Selection", "The <b>evaluation of project ideas</b> to decide which has the <b>highest priority</b>. Selecting a promising idea from a list based on conditions set by the entrepreneur or firm. It is the <b>second step after project identification</b> in the project planning cycle, and an important part of <b>Project Portfolio Management (PPM)</b>, used by PMOs (project management organizations) and project managers to analyze the potential return of a project.")
S.append(h3("Enumeration: 4 Steps in How to Select a Project"))
S += table(["#", "Step", "Key Point"], [
    ["1", "Make sure the project fits the company's strategy", "Discuss with stakeholders how it supports one or more organizational goals (short- or long-term)"],
    ["2", "Understand your company environment", "Ask: key business drivers? strengths and weaknesses? limited resources? where is it lacking?"],
    ["3", "Consider and analyze historical data", "Past outcomes' environmental and organizational factors may still be relevant; discuss changes with executives"],
    ["4", "Decide who will be the project champion", "A <b>high-level employee or executive</b> responsible for keeping the project on track through completion, coordinating all stakeholders"],
], [0.5, 3.6, 6.4])

S.append(h3("Enumeration: 7 Project Selection Methods"))
S += table(["#", "Method", "Description"], [
    ["1", "Cost-benefit analysis", "Estimating <b>total costs and potential profits</b> by evaluating different solutions: identify possible solutions (from project description, business need, objectives), then assess costs and benefits of each"],
    ["2", "Payback period", "Time to <b>recover the cost of an investment</b>. Example: spend $300,000, earn $30,000/year &rarr; payback period = <b>10 years</b>"],
    ["3", "Discounted cash flow", "Estimates future cash inflows <b>adjusted for the time value of money</b> (a dollar today is worth more than a dollar in the future because it can be invested). Example: at 5% interest, $1 today grows to <b>$1.05</b> in a year; a $1 payment delayed a year has a present value of about <b>95 cents</b>. (The slide prints &ldquo;$2.12&rdquo;, which appears to be a typo.)"],
    ["4", "Opportunity costs", "The <b>potential benefits a company forgoes</b> when choosing one option over another; makes cost-benefit analysis more comprehensive by considering missed alternatives"],
    ["5", "Ranking method", "Assigns a <b>priority scale</b> to projects based on importance. Main advantage: <b>speed</b>; useful when there are few, simple criteria"],
    ["6", "Scoring model", "Evaluates projects on <b>multiple criteria</b> (risk, ROI, benefits). Each criterion is rated and <b>weighted</b>; final score = <b>ratings &times; weights, summed</b>. Useful for comparing diverse projects"],
    ["7", "Analytic Hierarchy Process (AHP)", "Combines <b>subjective elements with mathematical models</b>. Compares criteria <b>in pairs</b>, reducing bias and errors, then normalizes and computes weighted scores. Converts abstract problems into numbers, giving transparency"],
], [0.5, 2.8, 7.2])

S.append(h2("Corporate Strategic Planning"))
S += defbox("Corporate Strategic Planning", "A <b>company-wide approach</b> at the business unit and corporate level for developing strategic plans to achieve a <b>longer-term vision</b>. Corporate strategic goals and intentions are defined at the <b>top</b> and <b>cascaded through each level</b> of the organization.")
S.append(h3("Why is Corporate Strategy Important?"))
S += bullets([
    "Aligns <b>employees and resources</b> with company goals.",
    "Improves efficiency and helps avoid costly mistakes.",
    "Enhances competitiveness by refining processes.",
    "The planning process begins by clarifying the organization's <b>vision, mission, and market position</b>.",
])

S.append(h2("Information Systems Planning (ISP)"))
S += bullets([
    "An essential part of corporate sectors and business planning roadmaps.",
    "Information moves between systems with different requirements for different groups (e.g., Marketing needs advertising reports; Finance needs monthly revenue reports; Supply chain needs logistical reports; HR needs staffing and employee details), so the <b>purposes of the systems must be clearly defined from the initial phase</b>.",
])
S.append(h3("Enumeration: 4 Sequential Phases of ISP"))
S += bullets(["<b>Defining Business Strategy</b>", "<b>Identifying Information System Mission</b>", "<b>Identifying Information System Components</b>", "<b>Information Systems Initiating and Budgeting</b>"], numbered=True)

S.append(h2("E-Commerce"))
S += defbox("E-Commerce", "The use of an <b>electronic medium for commercial transactions</b>; commonly refers to selling products and services <b>over the Internet</b> to consumers or other businesses.")
S.append(h3("Enumeration: 3 Classes of E-Commerce"))
S += table(["Class", "Description", "Examples"], [
    ["Business-to-Business (B2B)", "All electronic transactions of goods or services <b>between companies</b>. Producers and traditional commerce wholesalers typically operate here.", "<b>Alibaba</b> (global B2B wholesale platform), <b>Salesforce</b> (cloud CRM and sales tools), <b>Amazon Business</b> (bulk purchasing and supplies)"],
    ["Business-to-Consumer (B2C)", "Electronic relationships between <b>businesses and individual consumers</b>, similar to traditional retail. Consumers often get more information, lower prices, personalized service, and faster order processing and delivery.", "<b>Amazon</b>, <b>Walmart</b> (online groceries, electronics, household items), <b>Netflix</b> (digital streaming)"],
    ["Consumer-to-Consumer (C2C)", "Electronic transactions <b>between consumers</b>, generally conducted through a <b>third party</b> that provides the online platform.", "<b>eBay</b> (auction or fixed price), <b>Etsy</b> (handmade/vintage), <b>Facebook Marketplace</b> (local buying and selling)"],
], [2, 4.5, 4])

# ============ MASTER LIST ============
S += part("MASTER LIST: ALL ENUMERATIONS AT A GLANCE")
S += table(["Topic", "Items (in order)"], [
    ["6 Components of an IS", "Hardware, Software, Data Sources, Telecommunications, Process, Human Expertise"],
    ["5 Phases of SDLC", "Planning, Analysis, Design, Implementation, Maintenance"],
    ["5 Framework Activities", "Communication, Planning, Modeling, Construction, Deployment"],
    ["4 SE Layers (bottom to top)", "A Quality Focus, Process, Methods, Tools"],
    ["4 SE Practices", "Understand the problem, Plan a solution, Carry out the plan, Examine the result for accuracy"],
    ["4 Eras of Software", "Early Days (1940s&ndash;50s), High-Level Languages (1950s&ndash;60s), Software Industry Emerges (1970s&ndash;80s), Modern Software Era (1990s&ndash;today)"],
    ["4 Fundamental Process Activities", "Software specification, development, validation, evolution"],
    ["3 Process Models", "Waterfall, Agile, Iterative"],
    ["Waterfall phases (diagram)", "Requirements, Analysis &amp; Design, Implementation, Verification, Deployment, Maintenance"],
    ["5 Factors in Choosing a Process Model", "Project size and complexity; stability of requirements; customer involvement and feedback; team size and expertise; schedule and time constraints"],
    ["McCall: Product Operation", "Correctness, Reliability, Efficiency, Integrity, Usability"],
    ["McCall: Product Revision", "Maintainability, Flexibility, Testability"],
    ["McCall: Product Transition", "Portability, Reusability, Interoperability"],
    ["5 Common Agile Practices", "Customer Collaboration, Iterative Development, Flexibility, Self-organizing Teams, Continuous Improvement"],
    ["8 Agile Frameworks", "Kanban, Scrum, XP, APF, XPM, ASD, DSDM, FDD"],
    ["3 Scrum Roles", "Scrum Master, Product Owner, Development Team"],
    ["4 Scrum Artifacts/Items", "Sprints, Product Backlog, Sprint Backlog, Sprint Burndown Chart"],
    ["4 Scrum Meetings", "Daily Scrum (15 min), Sprint Planning (8 h), Sprint Review (4 h), Sprint Retrospective (3 h)"],
    ["5 XP Values", "Communication, Simplicity, Feedback, Courage, Respect"],
    ["5 XP Practices", "TDD, Code Refactoring, Continuous Integration, Pair Programming, Coding Standards"],
    ["ASD phases", "Speculate, Collaborate, Learn"],
    ["4 DSDM phases", "Feasibility and Business Study; Functional Model or Prototype Iteration; Design and Build Iteration; Implementation"],
    ["FDD process", "Develop overall model, Build features list, Plan by feature, Design by feature, Build by feature"],
    ["12 Agile Principles", "See Part 4 table"],
    ["Scaling frameworks", "SAFe, LeSS, Spotify model"],
    ["5 PMBOK Phases", "Initiation, Planning, Execution, Monitoring and Controlling, Closure"],
    ["S.M.A.R.T.", "Specific, Measurable, Attainable, Realistic, Timely"],
    ["C.L.E.A.R.", "Collaborative, Limited, Emotional, Appreciable, Refinable"],
    ["7 Steps of Project Identification", "Brainstorm; Initiate; Feasibility/viability studies; Complete schedule; Risk analysis; Estimate resources; Submit for approval"],
    ["5 Risk Analysis Methods", "Qualitative, Quantitative, SWOT, Root Cause Analysis (RCA), FMEA"],
    ["4 Steps to Select a Project", "Fit company strategy; Understand company environment; Analyze historical data; Decide the project champion"],
    ["7 Project Selection Methods", "Cost-benefit analysis, Payback period, Discounted cash flow, Opportunity costs, Ranking method, Scoring model, Analytic Hierarchy Process"],
    ["4 Phases of ISP", "Defining Business Strategy, Identifying IS Mission, Identifying IS Components, IS Initiating and Budgeting"],
    ["3 Classes of E-Commerce", "Business-to-Business, Business-to-Consumer, Consumer-to-Consumer"],
], [3, 8])

S.append(Spacer(1, 6))
S.append(P("<i>Good luck on your prelims!</i>", ParagraphStyle("gl", parent=body, alignment=TA_CENTER, textColor=NAVY)))

doc.build(S)
print("done")