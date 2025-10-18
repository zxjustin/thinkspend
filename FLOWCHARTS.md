# ThinkSpend - Flow Diagrams

Complete visual guide to data flows and architecture using Mermaid diagrams.

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [User Authentication Flow](#2-user-authentication-flow)
3. [Note Creation & Editing Flow](#3-note-creation--editing-flow)
4. [Expense Detection Flow](#4-expense-detection-flow)
5. [Cross-Note Discovery Algorithm](#5-cross-note-discovery-algorithm)
6. [Wiki Link Flow](#6-wiki-link-flow)
7. [Auto-Save Mechanism](#7-auto-save-mechanism)
8. [Knowledge Graph Rendering](#8-knowledge-graph-rendering)
9. [Database Schema Relationships](#9-database-schema-relationships)
10. [Component Hierarchy](#10-component-hierarchy)
11. [State Management Flow](#11-state-management-flow)
12. [Complete User Journey](#12-complete-user-journey)

---

## 1. High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend - Vue 3"
        A[User Interface]
        B[Vue Router]
        C[Pinia Stores]
        D[Composables]
        E[Components]
    end

    subgraph "Backend - Supabase"
        F[PostgreSQL Database]
        G[Auth Service]
        H[Realtime]
        I[Row Level Security]
    end

    A --> B
    B --> E
    E --> C
    C --> D
    D --> J[Supabase Client]
    J --> F
    J --> G
    J --> H
    F --> I

    style A fill:#81A2BE
    style F fill:#B5BD68
    style C fill:#DE935F
```

---

## 2. User Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant L as LoginView
    participant AS as AuthStore
    participant S as Supabase Auth
    participant R as Router

    U->>L: Enter email & password
    L->>AS: signIn(email, password)
    AS->>S: auth.signInWithPassword()

    alt Success
        S-->>AS: {user, session}
        AS->>AS: user.value = user
        AS-->>L: Success
        L->>R: Navigate to /notes
        R->>U: Show NotesView
    else Error
        S-->>AS: {error}
        AS->>AS: error.value = error.message
        AS-->>L: Error
        L->>U: Display error message
    end
```

---

## 3. Note Creation & Editing Flow

```mermaid
flowchart TD
    Start([User Opens NotesView]) --> LoadFolders[Load Folders from DB]
    LoadFolders --> SelectFolder{Select Folder}
    SelectFolder --> CreateNote[Click Create Note]
    CreateNote --> InsertDB[(Insert into notes table)]
    InsertDB --> SetCurrent[Set as currentNote]
    SetCurrent --> LoadEditor[Load in TipTap Editor]

    LoadEditor --> UserTypes[User Types Content]
    UserTypes --> ReactiveUpdate[content.value = editor.getHTML()]
    ReactiveUpdate --> ParseExpenses{Parse for Expenses}
    ReactiveUpdate --> ParseLinks{Parse for [[Links]]}

    ParseExpenses --> ShowBadge[Show Expense Count Badge]
    ParseLinks --> HighlightLinks[Highlight Wiki Links]

    UserTypes --> TriggerSave[Trigger Auto-Save]
    TriggerSave --> Debounce{Wait 2 seconds}
    Debounce -->|Still typing| UserTypes
    Debounce -->|No more typing| SaveToDB

    SaveToDB[(Update notes table)] --> ProcessExpenses[Process Detected Expenses]
    SaveToDB --> ProcessLinks[Process Detected Links]

    ProcessExpenses --> CreateExpenseRecords[Create Expense Records]
    CreateExpenseRecords --> RunDiscovery[Run Cross-Note Discovery]
    RunDiscovery --> CreateContextLinks[Create Context Links]

    ProcessLinks --> FindTargetNotes[Find Target Notes by Title]
    FindTargetNotes --> CreateNoteLinks[Create Note Links]

    CreateContextLinks --> UpdateUI[Update Connection Panel]
    CreateNoteLinks --> UpdateUI
    UpdateUI --> Done([Done - UI Refreshed])

    style Start fill:#81A2BE
    style Done fill:#B5BD68
    style RunDiscovery fill:#DE935F
```

---

## 4. Expense Detection Flow

```mermaid
flowchart LR
    subgraph "User Input"
        A["User types:<br/>$25 Lunch [Food]"]
    end

    subgraph "Real-time Detection"
        B[TipTap Editor Update]
        C[watch content fires]
        D[useExpenseParser.parseExpenses]
        E{Regex Match}
    end

    subgraph "Parsing Logic"
        F[Extract: amount = 25]
        G[Extract: description = 'Lunch']
        H[Extract: category = 'Food']
        I{Validate Category}
    end

    subgraph "UI Update"
        J[detectedExpenses.value = [...]]
        K[Show Badge: '1 expense']
        L[Highlight in Editor]
    end

    subgraph "On Save"
        M{Check Duplicates}
        N[Create Expense Record]
        O[Create 'mentioned' Link]
        P[Run Cross-Note Discovery]
    end

    A --> B --> C --> D --> E
    E -->|Match| F & G & H
    F & G & H --> I
    I -->|Valid| J
    I -->|Invalid| Q[Default to 'Other']
    Q --> J
    J --> K & L

    L --> M
    M -->|Not Duplicate| N --> O --> P
    M -->|Duplicate| R[Skip]

    style A fill:#81A2BE
    style P fill:#DE935F
    style K fill:#B5BD68
```

---

## 5. Cross-Note Discovery Algorithm

```mermaid
flowchart TD
    Start([Expense Created]) --> Extract[Extract Search Terms]

    Extract --> Filter{Filter Terms}
    Filter -->|Keep| Length{length >= 3?}
    Filter -->|Remove| StopWords[Stop words: the, and, or...]
    Filter -->|Remove| Numbers[Pure numbers]

    Length -->|Yes| TermsList[Search Terms List]
    Length -->|No| Remove[Remove]

    TermsList --> AddCategory[Add Category to Terms]
    AddCategory --> FetchNotes[(Fetch ALL User Notes)]

    FetchNotes --> LoopNotes{For Each Note}

    LoopNotes --> CalcRelevance[Calculate Relevance Score]

    subgraph "Relevance Scoring"
        CalcRelevance --> CheckTitle{Term in Title?}
        CheckTitle -->|Yes| TitleScore["+2.0 weight"]
        CheckTitle -->|No| CheckContent

        CheckContent{Term in Content?}
        CheckContent -->|Yes| ContentScore["+1.0 weight"]
        CheckContent -->|No| NextTerm

        TitleScore --> CheckCategory
        ContentScore --> CheckCategory
        CheckCategory{Category Match?}
        CheckCategory -->|Yes| CategoryBonus["+1.5 bonus"]
        CheckCategory -->|No| NextTerm
        CategoryBonus --> NextTerm

        NextTerm[Next Search Term]
    end

    NextTerm --> NormalizeScore[Normalize: matched/total terms]
    NormalizeScore --> StoreScore[Store: {note, score}]

    StoreScore --> LoopNotes
    LoopNotes -->|All Done| FilterThreshold{Score >= 0.3?}

    FilterThreshold -->|Yes| SortByScore[Sort by Score DESC]
    FilterThreshold -->|No| Discard[Discard]

    SortByScore --> TakeTop5[Take Top 5]

    TakeTop5 --> CreateLinks{For Each Relevant Note}
    CreateLinks --> InsertLink[(Insert note_expense_link)]
    InsertLink --> SetType["link_type = 'context'"]
    SetType --> SetStrength["strength = score"]
    SetStrength --> LogResult[Log: Created link]

    LogResult --> CreateLinks
    CreateLinks -->|All Done| Return([Return Links Array])

    style Start fill:#81A2BE
    style Return fill:#B5BD68
    style CalcRelevance fill:#DE935F
    style InsertLink fill:#B294BB
```

---

## 6. Wiki Link Flow

```mermaid
sequenceDiagram
    participant U as User
    participant E as TipTap Editor
    participant W as WikiLink Extension
    participant D as useLinkDetector
    participant NS as NotesStore
    participant DB as Supabase DB

    Note over U,E: Creation Phase
    U->>E: Types "See [[Project Alpha]]"
    E->>W: Input rule detects [[...]]
    W->>W: Convert to wikiLink node
    W->>E: Render as <span class="wiki-link-text">
    E->>U: Show styled link (purple)

    Note over E,DB: Save Phase
    E->>E: Auto-save triggers
    E->>D: extractLinks(content)
    D-->>E: ["Project Alpha"]
    E->>NS: findNoteByTitle("Project Alpha")
    NS->>DB: SELECT * WHERE title ILIKE 'Project Alpha'

    alt Target Note Found
        DB-->>NS: {id, title, ...}
        NS->>NS: createNoteLink(source, target, "Project Alpha")
        NS->>DB: INSERT INTO note_links
        DB-->>NS: Success
        NS-->>E: Link created
    else Not Found
        DB-->>NS: null
        NS-->>E: Target not found (skip)
    end

    Note over U,DB: Click Phase
    U->>E: Clicks wiki link
    E->>W: Click event
    W->>E: Emit onLinkClick("Project Alpha")
    E->>NS: findNoteByTitle("Project Alpha")
    NS->>DB: SELECT * WHERE title ILIKE
    DB-->>NS: {note}
    NS->>NS: selectNote(note.id)
    NS-->>E: currentNote updated
    E->>E: Load new note content
    E->>U: Show new note
```

---

## 7. Auto-Save Mechanism

```mermaid
stateDiagram-v2
    [*] --> Idle

    Idle --> Typing: User types
    Typing --> Debouncing: Trigger save
    Debouncing --> Typing: User types again (reset timer)
    Debouncing --> Saving: 2 seconds elapsed

    Saving --> UpdatingDB: Update notes table
    UpdatingDB --> ProcessingExpenses: Process expenses
    ProcessingExpenses --> ProcessingLinks: Process links
    ProcessingLinks --> Saved: All complete

    Saved --> Idle: Wait for next change

    UpdatingDB --> Error: Database error
    Error --> Idle: Show error status

    note right of Debouncing
        Timer: 2000ms
        Prevents spam
    end note

    note right of ProcessingExpenses
        1. Check duplicates
        2. Create expense records
        3. Run discovery algorithm
    end note

    note right of Saved
        Status indicator:
        "Saved ✓"
    end note
```

---

## 8. Knowledge Graph Rendering

```mermaid
flowchart TD
    Start([User Clicks 'Knowledge Graph']) --> FetchData{Fetch Data}

    FetchData --> FetchNotes[(Get all notes)]
    FetchData --> FetchExpenses[(Get all expenses)]
    FetchData --> FetchLinks[(Get all links)]

    FetchNotes --> BuildNodes[Build Nodes Array]
    FetchExpenses --> BuildNodes

    BuildNodes --> NodeType{Node Type}
    NodeType -->|Note| NoteNode["{ id, type: 'note', color: blue }"]
    NodeType -->|Expense| ExpenseNode["{ id, type: 'expense', color: green }"]

    NoteNode --> Nodes[nodes[]]
    ExpenseNode --> Nodes

    FetchLinks --> BuildEdges[Build Edges Array]
    BuildEdges --> EdgeType{Link Type}
    EdgeType -->|mentioned| Strong["{ source, target, strength: 1.0 }"]
    EdgeType -->|context| Weak["{ source, target, strength: 0.3-0.7 }"]

    Strong --> Edges[edges[]]
    Weak --> Edges

    Nodes --> InitD3[Initialize D3 Simulation]
    Edges --> InitD3

    InitD3 --> Forces[Configure Forces]
    Forces --> LinkForce[Link Force: distance=100]
    Forces --> ChargeForce[Charge Force: strength=-300]
    Forces --> CenterForce[Center Force: center of canvas]
    Forces --> CollisionForce[Collision Force: radius=30]

    LinkForce --> RunSimulation[Start Simulation]
    ChargeForce --> RunSimulation
    CenterForce --> RunSimulation
    CollisionForce --> RunSimulation

    RunSimulation --> Tick{On Each Tick}
    Tick --> UpdatePositions[Update Node/Edge Positions]
    UpdatePositions --> Render[Render SVG]
    Render --> Stable{Simulation Stable?}

    Stable -->|No| Tick
    Stable -->|Yes| Interactive[Enable Interactions]

    Interactive --> Drag[Drag nodes]
    Interactive --> Click[Click to navigate]
    Interactive --> Zoom[Zoom & pan]

    Drag --> Done([Graph Ready])
    Click --> Done
    Zoom --> Done

    style Start fill:#81A2BE
    style Done fill:#B5BD68
    style InitD3 fill:#DE935F
```

---

## 9. Database Schema Relationships

```mermaid
erDiagram
    USERS ||--o{ FOLDERS : owns
    USERS ||--o{ NOTES : owns
    USERS ||--o{ EXPENSES : owns

    FOLDERS ||--o{ FOLDERS : contains
    FOLDERS ||--o{ NOTES : contains

    NOTES ||--o{ NOTE_LINKS : source
    NOTES ||--o{ NOTE_LINKS : target

    NOTES ||--o{ NOTE_EXPENSE_LINKS : references
    EXPENSES ||--o{ NOTE_EXPENSE_LINKS : references

    NOTES ||--o{ EXPENSES : "mentioned in"

    USERS {
        uuid id PK
        string email
        timestamp created_at
    }

    FOLDERS {
        uuid id PK
        uuid user_id FK
        uuid parent_id FK
        string name
        int position
        timestamp created_at
        timestamp updated_at
    }

    NOTES {
        uuid id PK
        uuid user_id FK
        uuid folder_id FK
        string title
        text content
        timestamp created_at
        timestamp updated_at
    }

    EXPENSES {
        uuid id PK
        uuid user_id FK
        decimal amount
        string description
        string category
        date date
        uuid source_note_id FK
        string detection_method
        timestamp created_at
    }

    NOTE_LINKS {
        uuid id PK
        uuid source_note_id FK
        uuid target_note_id FK
        string link_text
        decimal strength
        timestamp created_at
    }

    NOTE_EXPENSE_LINKS {
        uuid id PK
        uuid note_id FK
        uuid expense_id FK
        string link_type
        decimal strength
        timestamp created_at
    }
```

---

## 10. Component Hierarchy

```mermaid
graph TD
    App[App.vue] --> Router[Vue Router]

    Router --> Login[LoginView]
    Router --> Notes[NotesView]
    Router --> Expenses[ExpensesView]
    Router --> Search[SearchView]

    Notes --> Layout1[AppLayout]
    Expenses --> Layout2[AppLayout]
    Search --> Layout3[AppLayout]

    Notes --> Sidebar[NoteSidebar]
    Notes --> Editor[NoteEditor]
    Notes --> Connection[ConnectionPanel]
    Notes --> Graph[GraphView]

    Sidebar --> FolderTree[FolderTree]
    FolderTree --> FolderItem[FolderItem]
    FolderItem --> FolderItem

    Editor --> TipTap[TipTap Editor]
    TipTap --> OrgMode[OrgMode Extension]
    TipTap --> WikiExt[WikiLink Extension]

    Search --> SearchBar[SearchBar]
    Search --> SearchResults[SearchResults]

    subgraph "Stores (Pinia)"
        AuthStore[auth.js]
        NotesStore[notes.js]
        ExpensesStore[expenses.js]
    end

    Login -.->|uses| AuthStore
    Sidebar -.->|uses| NotesStore
    Editor -.->|uses| NotesStore
    Editor -.->|uses| ExpensesStore
    Connection -.->|uses| NotesStore
    Connection -.->|uses| ExpensesStore
    Graph -.->|uses| NotesStore
    Graph -.->|uses| ExpensesStore

    subgraph "Composables"
        ExpenseParser[useExpenseParser]
        LinkDetector[useLinkDetector]
        AutoSave[useAutoSave]
        SearchComp[useSearch]
    end

    Editor -.->|uses| ExpenseParser
    Editor -.->|uses| LinkDetector
    Editor -.->|uses| AutoSave
    Search -.->|uses| SearchComp

    subgraph "Libraries"
        Supabase[supabase.js]
        Discovery[crossNoteDiscovery.js]
    end

    AuthStore -.->|uses| Supabase
    NotesStore -.->|uses| Supabase
    ExpensesStore -.->|uses| Supabase
    ExpensesStore -.->|uses| Discovery
    Discovery -.->|uses| Supabase

    style App fill:#81A2BE
    style NotesStore fill:#B5BD68
    style Discovery fill:#DE935F
```

---

## 11. State Management Flow

```mermaid
flowchart LR
    subgraph "User Action"
        A[User Interaction]
    end

    subgraph "Component Layer"
        B[Vue Component]
        C[Event Handler]
    end

    subgraph "Store Layer - Pinia"
        D[Store Action]
        E[State Mutation]
    end

    subgraph "API Layer"
        F[Supabase Client]
        G[HTTP Request]
    end

    subgraph "Backend"
        H[(PostgreSQL)]
        I[Row Level Security]
    end

    subgraph "Reactivity"
        J[Computed Properties]
        K[Watchers]
        L[UI Re-render]
    end

    A --> B
    B --> C
    C --> D
    D --> F
    F --> G
    G --> H
    H --> I
    I --> G
    G --> F
    F --> E
    E --> J
    E --> K
    J --> L
    K --> L
    L --> A

    style A fill:#81A2BE
    style E fill:#B5BD68
    style H fill:#DE935F
    style L fill:#B294BB
```

---

## 12. Complete User Journey

```mermaid
journey
    title Complete User Journey - Creating a Note with Expenses
    section Authentication
        Open App: 3: User
        See Login Page: 5: User
        Enter Credentials: 4: User
        Click Sign In: 5: User
        Authenticated: 5: System
    section Navigation
        Redirect to /notes: 5: System
        Load Folders: 4: System
        Display Folder Tree: 5: User
    section Note Creation
        Click Create Note: 5: User
        Note Inserted in DB: 5: System
        Editor Loads: 5: User
        Type Title: 5: User
    section Content Entry
        Type Content: 5: User
        Type Expense Syntax: 5: User
        See Expense Badge: 4: User
        Type Wiki Link: 5: User
        See Link Highlighted: 4: User
    section Auto-Save
        Stop Typing: 3: User
        Debounce Timer: 3: System
        Save to Database: 5: System
        Status: Saving: 4: User
    section Processing
        Parse Expenses: 5: System
        Create Expense Records: 5: System
        Run Discovery Algorithm: 5: System
        Find Related Notes: 5: System
        Create Context Links: 5: System
        Parse Wiki Links: 5: System
        Create Note Links: 5: System
    section Feedback
        Status: Saved: 5: User
        Connection Panel Updates: 5: User
        See Linked Expenses: 5: User
        See Related Notes: 5: User
        Console Logs: 4: Developer
    section Exploration
        Click Knowledge Graph: 5: User
        See Visualization: 5: User
        Explore Connections: 5: User
        Click Node to Navigate: 5: User
```

---

## 13. Expense Detection - Detailed Flow

```mermaid
flowchart TD
    Start([User Types in Editor]) --> Input["Input: $25 Lunch [Food]"]

    Input --> EditorUpdate[TipTap onUpdate Event]
    EditorUpdate --> SetContent["content.value = editor.getHTML()"]

    SetContent --> Watcher{watch content fires}
    Watcher --> CallParser[parseExpenses(content)]

    subgraph "useExpenseParser.js"
        CallParser --> StripHTML[Strip HTML Tags]
        StripHTML --> Regex[Apply Regex Pattern]

        Regex --> Pattern["Pattern: /\$(\d+(?:\.\d{1,2})?)\s+([^\[\n$]+?)\s*\[([^\]]+)\]/g"]

        Pattern --> Loop{For Each Match}

        Loop --> ExtractAmount[amount = parseFloat match[1]]
        Loop --> ExtractDesc[description = match[2].trim]
        Loop --> ExtractCat[category = match[3].trim]

        ExtractAmount --> Validate{Validate}
        ExtractDesc --> Validate
        ExtractCat --> Validate

        Validate -->|amount > 0| CheckCategory
        Validate -->|amount <= 0| Skip1[Skip]

        CheckCategory{Category Valid?}
        CheckCategory -->|Yes| CreateObj
        CheckCategory -->|No| DefaultOther["category = 'Other'"]
        DefaultOther --> CreateObj

        CreateObj[Create Expense Object]
        CreateObj --> AddToArray["expenses.push({amount, description, category})"]

        AddToArray --> Loop
        Loop -->|Done| Return[Return expenses[]]
    end

    Return --> UpdateReactive["detectedExpenses.value = expenses"]
    UpdateReactive --> UpdateBadge["Show badge: '1 expense'"]

    UpdateReactive --> WatchSave{watch [title, content]}
    WatchSave --> TriggerAS[triggerSave]
    TriggerAS --> Debounce[2 second debounce]

    Debounce --> SaveNote[Save Note to DB]
    SaveNote --> ProcessExp[processDetectedExpenses]

    subgraph "processDetectedExpenses"
        ProcessExp --> CheckDup{Check Duplicates}
        CheckDup -->|Not Duplicate| CreateExp[createExpense]
        CheckDup -->|Duplicate| Skip2[Skip]

        CreateExp --> InsertExpDB[(INSERT INTO expenses)]
        InsertExpDB --> CreateLink[createNoteExpenseLink]
        CreateLink --> InsertLinkDB[("INSERT INTO note_expense_links<br/>link_type='mentioned'<br/>strength=1.0")]

        InsertLinkDB --> Discovery[discoverRelatedNotes]
        Discovery --> Algorithm[Cross-Note Discovery Algorithm]
        Algorithm --> ContextLinks[Create Context Links]
    end

    ContextLinks --> Done([Done])

    style Input fill:#81A2BE
    style Algorithm fill:#DE935F
    style Done fill:#B5BD68
    style InsertExpDB fill:#B294BB
```

---

## 14. Cross-Note Discovery - Performance Analysis

```mermaid
graph LR
    subgraph "Input"
        A["Expense:<br/>$250 Adobe License [Software]"]
    end

    subgraph "Step 1: Extract Terms - O(n)"
        B[Split description]
        C[Filter stop words]
        D[Remove short words]
        E["Result: ['adobe', 'license', 'software']"]
    end

    subgraph "Step 2: Fetch Notes - O(1)"
        F[(SELECT * FROM notes<br/>WHERE user_id = X)]
        G["100 notes fetched"]
    end

    subgraph "Step 3: Score Notes - O(n × m × k)"
        H{For each note}
        I["For each term"]
        J["Search in title<br/>(avg 5 words)"]
        K["Search in content<br/>(avg 500 words)"]
        L["Calculate score"]
    end

    subgraph "Step 4: Filter & Sort - O(n log n)"
        M["Filter: score >= 0.3"]
        N["Sort by score DESC"]
        O["Take top 5"]
    end

    subgraph "Step 5: Create Links - O(k)"
        P{For top 5}
        Q[(INSERT INTO<br/>note_expense_links)]
    end

    subgraph "Output"
        R["5 context links created<br/>Total time: ~28ms"]
    end

    A --> B --> C --> D --> E
    E --> F --> G
    G --> H
    H --> I
    I --> J
    I --> K
    J --> L
    K --> L
    L --> H
    H --> M --> N --> O
    O --> P --> Q
    Q --> P
    P --> R

    style A fill:#81A2BE
    style R fill:#B5BD68
    style H fill:#DE935F

    classDef complexity fill:#CC6666
    class H,I complexity
```

---

## 15. React Event Flow

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant V as Vue Component
    participant R as Reactive Ref
    participant W as Watcher
    participant S as Store Action
    participant DB as Supabase
    participant UI as Vue Renderer

    U->>V: Types in editor
    V->>R: content.value = newValue
    R->>W: Dependency triggered
    W->>W: Execute callback

    alt Expense Detection Watcher
        W->>W: parseExpenses(content)
        W->>R: detectedExpenses.value = [...]
        R->>UI: Re-render badge
    end

    alt Auto-Save Watcher
        W->>W: triggerSave() debounced
        Note over W: Wait 2 seconds...
        W->>S: notesStore.updateNote()
        S->>DB: UPDATE notes SET...
        DB-->>S: Success
        S->>R: Update local state
        R->>UI: Re-render status
    end

    UI->>U: Show updated UI
```

---

## 16. Error Handling Flow

```mermaid
flowchart TD
    Start([User Action]) --> Try{Try Block}

    Try --> AsyncOp[Async Operation]
    AsyncOp --> Supabase[Supabase Query]

    Supabase --> Check{Check Error}

    Check -->|No Error| Success[Process Data]
    Success --> UpdateState[Update Store State]
    UpdateState --> UISuccess[Show Success UI]
    UISuccess --> Done1([Done])

    Check -->|Error| CatchBlock[Catch Block]
    CatchBlock --> LogError["console.error(error)"]
    LogError --> CheckType{Error Type}

    CheckType -->|Duplicate Key 23505| SkipDup[Skip - Already Exists]
    CheckType -->|Auth Error| RedirectLogin[Redirect to /login]
    CheckType -->|Network Error| ShowRetry[Show Retry Button]
    CheckType -->|Other| ShowError[Show Error Message]

    SkipDup --> UIWarning[Show Warning Toast]
    RedirectLogin --> Router[router.push('/login')]
    ShowRetry --> RetryButton[User Clicks Retry]
    ShowError --> ErrorState[Set error.value]

    UIWarning --> Done2([Done])
    Router --> Done2
    RetryButton --> Start
    ErrorState --> UIError[Display Error in UI]
    UIError --> Done2

    style Success fill:#B5BD68
    style CatchBlock fill:#CC6666
    style Done1 fill:#81A2BE
    style Done2 fill:#81A2BE
```

---

## 17. Wiki Link Detection & Navigation

```mermaid
stateDiagram-v2
    [*] --> Editing: User types "[[Project]]"

    Editing --> InputRuleMatch: TipTap detects [[...]]
    InputRuleMatch --> NodeCreated: Create wikiLink node
    NodeCreated --> Rendered: Render as <span>
    Rendered --> Styled: Apply CSS (purple, underline)

    Styled --> WaitingForSave: User continues typing
    WaitingForSave --> AutoSaveTriggered: 2 seconds idle

    AutoSaveTriggered --> ExtractingLinks: extractLinks(content)
    ExtractingLinks --> SearchingDB: findNoteByTitle("Project")

    SearchingDB --> TargetFound: Note exists
    SearchingDB --> TargetNotFound: Note doesn't exist

    TargetFound --> CreatingLink: INSERT INTO note_links
    CreatingLink --> LinkSaved: Link created
    LinkSaved --> Interactive: Ready for interaction

    TargetNotFound --> SkipLink: Skip link creation
    SkipLink --> Interactive

    Interactive --> ClickDetected: User clicks link
    ClickDetected --> ResolveTarget: findNoteByTitle again
    ResolveTarget --> Navigate: selectNote(targetId)
    Navigate --> LoadNote: Load in editor
    LoadNote --> [*]

    note right of CreatingLink
        Bidirectional:
        - Outgoing link stored
        - Backlink queryable
    end note

    note right of TargetNotFound
        Broken link:
        Still styled but
        won't navigate
    end note
```

---

## How to Use These Diagrams

### In GitHub README.md:

```markdown
# ThinkSpend Architecture

## System Overview
```mermaid
graph TB
    A[Frontend] --> B[Supabase]
    ...
```
```

### Render on GitHub:
- GitHub automatically renders Mermaid diagrams
- Works in README.md, wiki pages, issues, PR descriptions
- No images needed - pure markdown!

### Export as Images:
1. Visit: https://mermaid.live/
2. Paste Mermaid code
3. Click "Export" → PNG/SVG
4. Use in presentations, reports

### Interactive Diagrams:
Add to your docs with Mermaid CLI:
```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i FLOWCHARTS.md -o flowcharts.pdf
```

---

## Legend

**Colors:**
- 🔵 Blue (#81A2BE) - Entry points, user actions
- 🟢 Green (#B5BD68) - Success states, completion
- 🟠 Orange (#DE935F) - Core algorithms, important processes
- 🟣 Purple (#B294BB) - Database operations
- 🔴 Red (#CC6666) - Errors, warnings

**Shapes:**
- Rectangle - Process/Action
- Diamond - Decision
- Circle - Start/End
- Cylinder - Database
- Parallelogram - Input/Output

---

**Created:** 2025-10-18
**For:** ThinkSpend Project Documentation
**Purpose:** Visual guide for developers, stakeholders, and academic reports
