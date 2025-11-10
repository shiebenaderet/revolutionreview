// ==================== DATA MODULE ====================
// Contains all study data for the Revolutionary War application

// Timeline events in chronological order
export const timelineEvents = [
    {
        id: 1,
        title: "Proclamation of 1763",
        year: "1763",
        description: "Britain banned colonists from settling west of Appalachian Mountains"
    },
    {
        id: 2,
        title: "Stamp Act",
        year: "1765",
        description: "Tax on printed materials like newspapers and legal documents"
    },
    {
        id: 3,
        title: "Quartering Act",
        year: "1765",
        description: "Forced colonists to house and feed British soldiers"
    },
    {
        id: 4,
        title: "Townshend Acts",
        year: "1767",
        description: "Taxes on imported goods like tea, glass, and paper"
    },
    {
        id: 5,
        title: "Boston Massacre",
        year: "1770",
        description: "British soldiers killed 5 colonists including Crispus Attucks"
    },
    {
        id: 6,
        title: "Boston Tea Party",
        year: "1773",
        description: "Colonists dumped British tea into Boston Harbor to protest taxes"
    },
    {
        id: 7,
        title: "Intolerable Acts",
        year: "1774",
        description: "Harsh punishment laws targeting Massachusetts after the Tea Party"
    },
    {
        id: 8,
        title: "First Continental Congress",
        year: "1774",
        description: "Colonial leaders met to coordinate response to Britain"
    },
    {
        id: 9,
        title: "Lexington & Concord",
        year: "1775",
        description: "First battles of the Revolutionary War - 'shot heard round the world'"
    },
    {
        id: 10,
        title: "Declaration of Independence",
        year: "1776",
        description: "Colonies declared independence from Britain"
    }
];

// Vocabulary terms with definitions, examples, and categories
export const vocabulary = [
    {
        term: "Proclamation",
        definition: "An official announcement or order made by a government or ruler",
        example: "The Proclamation of 1763 banned colonists from settling west of the Appalachian Mountains",
        category: "Causes of Unrest"
    },
    {
        term: "Quarter/Quartering",
        definition: "To provide housing, food, and supplies to soldiers",
        example: "The Quartering Act forced colonists to house British soldiers in their homes",
        category: "Causes of Unrest"
    },
    {
        term: "Tax",
        definition: "Money that people are required to pay to the government",
        example: "The Stamp Act taxed printed materials like newspapers and legal documents",
        category: "Causes of Unrest"
    },
    {
        term: "Representation",
        definition: "Having someone speak and vote for you in government",
        example: "Colonists argued 'no taxation without representation' - they wanted a voice in Parliament",
        category: "Causes of Unrest"
    },
    {
        term: "Boycott",
        definition: "Refusing to buy or use certain goods as a form of protest",
        example: "Colonists boycotted British goods after the Stamp Act to pressure Britain economically",
        category: "Causes of Unrest"
    },
    {
        term: "Repeal",
        definition: "To officially cancel or revoke a law",
        example: "Britain repealed the Stamp Act in 1766 after massive colonial protests",
        category: "Causes of Unrest"
    },
    {
        term: "Intolerable (Coercive)",
        definition: "Too extreme or severe to be endured; unbearable",
        example: "The Intolerable Acts punished all of Massachusetts by closing Boston Harbor",
        category: "Causes of Unrest"
    },
    {
        term: "Minutemen",
        definition: "Colonial militia members ready to fight at a minute's notice",
        example: "Minutemen fought British troops at Lexington and Concord in April 1775",
        category: "Causes of Unrest"
    },
    {
        term: "Casualties",
        definition: "People killed or injured in a battle or conflict",
        example: "The Boston Massacre resulted in 5 casualties, including Crispus Attucks",
        category: "Causes of Unrest"
    },
    {
        term: "Escalation",
        definition: "When a conflict grows more intense or serious over time",
        example: "From 1763-1775, conflicts escalated from protests to armed rebellion",
        category: "Causes of Unrest"
    },
    {
        term: "Patriot",
        definition: "A colonist who supported independence from Britain",
        example: "Samuel Adams was a Patriot who organized protests against British policies",
        category: "Uncovering Loyalties"
    },
    {
        term: "Loyalist (Tory)",
        definition: "A colonist who remained loyal to King George III and Britain",
        example: "Many wealthy merchants were Loyalists because their business depended on British trade",
        category: "Uncovering Loyalties"
    },
    {
        term: "Neutral",
        definition: "Refusing to take sides in a conflict",
        example: "Some colonists stayed neutral to protect their families from retaliation",
        category: "Uncovering Loyalties"
    },
    {
        term: "Perspective",
        definition: "A person's point of view shaped by their experiences and identity",
        example: "Enslaved people had a different perspective on 'liberty' than wealthy colonists",
        category: "Uncovering Loyalties"
    },
    {
        term: "Rebellion",
        definition: "Armed resistance against a government or ruler",
        example: "British saw colonial resistance as illegal rebellion; colonists saw it as justified",
        category: "Uncovering Loyalties"
    },
    {
        term: "Independence",
        definition: "Freedom from being controlled by another country; self-governance",
        example: "The Declaration of Independence announced America's freedom from Britain",
        category: "Declaration"
    },
    {
        term: "Unalienable Rights",
        definition: "Rights that cannot be taken away - they belong to all people",
        example: "Jefferson listed life, liberty, and the pursuit of happiness as unalienable rights",
        category: "Declaration"
    },
    {
        term: "Consent of the Governed",
        definition: "Government power comes from the permission of the people it rules",
        example: "The Declaration says government needs consent of the governed to be legitimate",
        category: "Declaration"
    },
    {
        term: "Tyranny",
        definition: "Cruel, oppressive, and unjust use of power",
        example: "Jefferson accused King George of tyranny for taxing colonists without their consent",
        category: "Declaration"
    },
    {
        term: "Treason",
        definition: "The crime of betraying your country",
        example: "Signers of the Declaration could be hanged for treason against Britain",
        category: "Declaration"
    },
    {
        term: "Abolish",
        definition: "To completely eliminate or destroy something",
        example: "The Declaration says people can abolish government when it becomes destructive",
        category: "Declaration"
    },
    {
        term: "Usurpations",
        definition: "Illegal seizures of power or rights",
        example: "Jefferson accused the king of repeated usurpations of colonists' rights",
        category: "Declaration"
    }
];

// Practice questions with options, correct answers, and explanations
export const questions = [
    {
        question: "The Proclamation of 1763 angered colonists because it:",
        options: [
            "Raised taxes on tea and paper",
            "Forced them to house British soldiers",
            "Prevented them from settling west of the Appalachian Mountains",
            "Closed Boston Harbor"
        ],
        correct: 2,
        explanation: "The Proclamation of 1763 banned colonists from settling west of the Appalachian Mountains. King George wanted to avoid conflicts with Native Americans, but colonists saw this as limiting their freedom and economic opportunities.",
        topic: "Causes of Unrest"
    },
    {
        question: "The Quartering Act required colonists to:",
        options: [
            "Pay a tax on all printed materials",
            "Provide housing and supplies for British soldiers",
            "Attend church services every Sunday",
            "Send their children to British schools"
        ],
        correct: 1,
        explanation: "The Quartering Act forced colonists to provide housing, food, and supplies to British soldiers. This was invasive and expensive, making colonists feel like their homes were being violated by an occupying army.",
        topic: "Causes of Unrest"
    },
    {
        question: "The colonial slogan 'No taxation without representation' meant that:",
        options: [
            "Colonists refused to pay any taxes to anyone",
            "Colonists believed they should only be taxed by their own elected representatives",
            "Only British citizens should pay taxes",
            "Taxes should be eliminated completely"
        ],
        correct: 1,
        explanation: "Colonists believed they should only be taxed by legislatures where they had elected representatives (like their colonial assemblies), not by British Parliament where they had no voice. This was a key principle behind their resistance.",
        topic: "Causes of Unrest"
    },
    {
        question: "The Stamp Act taxed colonists on:",
        options: [
            "Imported goods like tea and glass",
            "Land ownership in the western territories",
            "Printed materials like newspapers and legal documents",
            "Clothing and household items"
        ],
        correct: 2,
        explanation: "The Stamp Act (1765) required colonists to buy special stamped paper for newspapers, legal documents, pamphlets, and even playing cards. This was the first direct tax on colonists and affected nearly everyone, sparking widespread protests.",
        topic: "Causes of Unrest"
    },
    {
        question: "Which event involved British soldiers firing into a crowd, killing 5 people including Crispus Attucks?",
        options: [
            "The Boston Tea Party",
            "The Boston Massacre",
            "Lexington and Concord",
            "The Intolerable Acts"
        ],
        correct: 1,
        explanation: "The Boston Massacre (1770) occurred when British soldiers fired into a crowd of colonists, killing five people including Crispus Attucks, a Black sailor. Patriots used this event as propaganda to show British cruelty.",
        topic: "Causes of Unrest"
    },
    {
        question: "The Boston Tea Party was a colonial protest against:",
        options: [
            "The Quartering Act",
            "The Stamp Act",
            "Taxes on tea imposed by the Townshend Acts",
            "The Proclamation of 1763"
        ],
        correct: 2,
        explanation: "The Boston Tea Party (1773) was a protest against the tea tax from the Townshend Acts. Colonists, some disguised as Native Americans, dumped 342 chests of British tea into Boston Harbor to protest taxation without representation.",
        topic: "Causes of Unrest"
    },
    {
        question: "The Intolerable Acts were Britain's response to:",
        options: [
            "The Stamp Act protests",
            "The Boston Tea Party",
            "The First Continental Congress",
            "Lexington and Concord"
        ],
        correct: 1,
        explanation: "The Intolerable Acts (also called Coercive Acts) were passed in 1774 to punish Massachusetts for the Boston Tea Party. They closed Boston Harbor, removed self-government, and strengthened the Quartering Act.",
        topic: "Causes of Unrest"
    },
    {
        question: "The First Continental Congress met in Philadelphia to:",
        options: [
            "Declare independence from Britain",
            "Discuss how to respond to British policies and organize a boycott",
            "Sign the Declaration of Independence",
            "Elect George Washington as president"
        ],
        correct: 1,
        explanation: "The First Continental Congress (1774) brought together delegates from 12 of the 13 colonies to discuss coordinated responses to the Intolerable Acts. They organized a boycott and prepared for possible armed conflict.",
        topic: "Causes of Unrest"
    },
    {
        question: "The Battles of Lexington and Concord marked:",
        options: [
            "The end of the Revolutionary War",
            "The signing of the Declaration of Independence",
            "The first military engagement of the Revolutionary War",
            "The repeal of the Stamp Act"
        ],
        correct: 2,
        explanation: "Lexington and Concord (April 1775) was 'the shot heard round the world' - the first military engagement between British troops and colonial minutemen. This marked the transition from protest to armed rebellion.",
        topic: "Causes of Unrest"
    },
    {
        question: "In the 1776 musical, who was the main advocate pushing for independence?",
        options: [
            "Benjamin Franklin",
            "John Adams",
            "Thomas Jefferson",
            "George Washington"
        ],
        correct: 1,
        explanation: "John Adams was frustrated with Congress's reluctance to declare independence. The musical shows him constantly pushing the delegates to take action, even though many thought he was too aggressive.",
        topic: "1776 Musical"
    },
    {
        question: "According to the musical, why didn't Thomas Jefferson initially want to write the Declaration?",
        options: [
            "He didn't believe in independence",
            "He was too busy with military duties",
            "He wanted to see his wife",
            "He thought someone else was better qualified"
        ],
        correct: 2,
        explanation: "Jefferson was homesick and wanted to return to Virginia to see his wife Martha, who was in poor health. This made him reluctant to take on the writing task, even though he was chosen for his writing skills.",
        topic: "1776 Musical"
    },
    {
        question: "Who were the three most important members of the committee to write the Declaration?",
        options: [
            "Adams, Washington, and Jefferson",
            "Franklin, Washington, and Adams",
            "Adams, Franklin, and Jefferson",
            "Jefferson, Madison, and Hamilton"
        ],
        correct: 2,
        explanation: "The Committee of Five included Adams, Franklin, and Jefferson as the main contributors. Adams convinced Jefferson to write it, and Franklin helped edit. The other two members (Sherman and Livingston) played smaller roles.",
        topic: "1776 Musical"
    },
    {
        question: "In the slavery debate scene, who objected to the anti-slavery language?",
        options: [
            "John Adams from Massachusetts",
            "Benjamin Franklin from Pennsylvania",
            "Edward Rutledge from South Carolina",
            "Thomas Jefferson from Virginia"
        ],
        correct: 2,
        explanation: "Edward Rutledge from South Carolina objected because slavery was central to the Southern economy. He threatened that Southern colonies would not support independence if the anti-slavery language remained.",
        topic: "1776 Musical"
    },
    {
        question: "Why did Adams and Franklin agree to remove the anti-slavery language?",
        options: [
            "They personally supported slavery",
            "They needed all 13 colonies to unite for independence",
            "King George demanded its removal",
            "They planned to address slavery later in the Constitution"
        ],
        correct: 1,
        explanation: "Adams and Franklin faced an impossible choice: keep the anti-slavery language and lose Southern support, or remove it to keep all 13 colonies united. They chose unity for immediate independence, compromising on slavery.",
        topic: "1776 Musical"
    },
    {
        question: "Benjamin Franklin's quote 'If we do not hang together, we shall most assuredly hang separately' meant:",
        options: [
            "They needed to celebrate their victory",
            "They should all move to different colonies",
            "If they didn't unite, the British would execute them individually for treason",
            "Hanging was a common punishment in colonial times"
        ],
        correct: 2,
        explanation: "Franklin's play on words meant they needed to 'hang together' (stick together/unite) or they would 'hang separately' (be executed for treason). It emphasized the life-or-death stakes of signing the Declaration.",
        topic: "1776 Musical"
    },
    {
        question: "A 'Patriot' during the Revolutionary Era was someone who:",
        options: [
            "Remained loyal to King George III",
            "Supported independence from Britain",
            "Refused to take sides in the conflict",
            "Moved to Canada to avoid the war"
        ],
        correct: 1,
        explanation: "Patriots were colonists who supported independence from Britain and were willing to fight for it. They believed British policies violated their rights and that the colonies should be self-governing.",
        topic: "Uncovering Loyalties"
    },
    {
        question: "A 'Loyalist' (also called a Tory) was someone who:",
        options: [
            "Supported independence from Britain",
            "Remained loyal to the British Crown",
            "Fought for Native American rights",
            "Worked as a spy for both sides"
        ],
        correct: 1,
        explanation: "Loyalists remained loyal to King George III and Britain. They might have had family ties to Britain, business connections, government positions, or feared the chaos of revolution.",
        topic: "Uncovering Loyalties"
    },
    {
        question: "Someone who was 'neutral' during the Revolutionary War:",
        options: [
            "Actively supported the Patriots",
            "Actively supported the Loyalists",
            "Did not take sides in the conflict",
            "Fought for whichever side paid more"
        ],
        correct: 2,
        explanation: "Neutral colonists refused to take sides. They might have feared retaliation, had divided family loyalties, held religious beliefs against violence, or simply wanted to protect their property regardless of who won.",
        topic: "Uncovering Loyalties"
    },
    {
        question: "Which group might have been MOST likely to side with the British because they hoped for freedom?",
        options: [
            "Wealthy colonial merchants",
            "Enslaved people",
            "Native Americans",
            "Indentured servants"
        ],
        correct: 1,
        explanation: "Lord Dunmore's Proclamation (1775) promised freedom to enslaved people who joined British forces. Many enslaved people saw the British as offering a path to liberty that Patriots would not.",
        topic: "Uncovering Loyalties"
    },
    {
        question: "Why might different people have had different perspectives on independence?",
        options: [
            "Their background, identity, and circumstances shaped their viewpoints",
            "Some people were better educated than others",
            "Everyone in each colony thought the same way",
            "Only wealthy people had perspectives worth considering"
        ],
        correct: 0,
        explanation: "Perspective was shaped by identity - enslaved people wanted freedom, Native Americans worried about land, women had no political voice, wealthy colonists weighed economic interests. Different stakes = different viewpoints.",
        topic: "Uncovering Loyalties"
    },
    {
        question: "'Unalienable rights' in the Declaration of Independence means:",
        options: [
            "Rights that can be taken away by the government",
            "Rights that cannot be taken away",
            "Rights only for wealthy white men",
            "Rights that must be earned through service"
        ],
        correct: 1,
        explanation: "Unalienable rights cannot be taken away, given up, or transferred - they belong to all people simply by virtue of being human. Jefferson argued these rights were 'self-evident' and given by the Creator.",
        topic: "Declaration"
    },
    {
        question: "The three unalienable rights specifically mentioned in the Declaration are:",
        options: [
            "Freedom, justice, and equality",
            "Life, liberty, and the pursuit of happiness",
            "Liberty, property, and security",
            "Life, freedom, and prosperity"
        ],
        correct: 1,
        explanation: "Jefferson wrote 'We hold these truths to be self-evident, that all men are created equal, that they are endowed by their Creator with certain unalienable Rights, that among these are Life, Liberty and the pursuit of Happiness.'",
        topic: "Declaration"
    },
    {
        question: "'Consent of the governed' means:",
        options: [
            "The government can do whatever it wants",
            "Only rich people should vote",
            "The government gets its power from the permission of the people",
            "Kings have divine right to rule"
        ],
        correct: 2,
        explanation: "Consent of the governed means government only has legitimate authority if the people agree to be governed. This was revolutionary - it challenged the idea of monarchy based on divine right.",
        topic: "Declaration"
    },
    {
        question: "According to the Declaration, what should people do when government becomes destructive?",
        options: [
            "Accept it because rebellion is wrong",
            "Move to a different country",
            "They have the right to change or abolish that government",
            "Wait for the next election"
        ],
        correct: 2,
        explanation: "The Declaration states that when government repeatedly violates people's rights and becomes destructive, 'it is the Right of the People to alter or to abolish it, and to institute new Government.' This justified revolution.",
        topic: "Declaration"
    },
    {
        question: "The Declaration of Independence accused King George III of:",
        options: [
            "Being too generous with the colonies",
            "Multiple acts of tyranny and taking away colonists' rights",
            "Not paying attention to the colonies",
            "Starting the French and Indian War"
        ],
        correct: 1,
        explanation: "The Declaration lists over 25 grievances against King George - dissolving legislatures, imposing taxes without consent, quartering soldiers, blocking trade, denying trial by jury, and more. This documented his tyranny.",
        topic: "Declaration"
    },
    {
        question: "The colonists tried to resolve issues with Britain peacefully before declaring independence. This shows:",
        options: [
            "The colonists were weak and afraid",
            "Independence was a last resort after peaceful attempts failed",
            "King George was willing to compromise",
            "The colonists never really wanted independence"
        ],
        correct: 1,
        explanation: "The Declaration states they tried petitions and appeals many times ('In every stage of these Oppressions We have Petitioned for Redress'). This shows independence was justified only after exhausting peaceful solutions.",
        topic: "Declaration"
    },
    {
        question: "Whose voices and rights were LEFT OUT when Jefferson wrote 'all men are created equal'?",
        options: [
            "Women, enslaved people, and Native Americans",
            "Poor white men",
            "Loyalists",
            "British soldiers"
        ],
        correct: 0,
        explanation: "The Declaration's ideals excluded women (who couldn't vote or own property), enslaved people (who were considered property), and Native Americans (called 'merciless savages'). Even some white men without property couldn't vote.",
        topic: "Declaration"
    },
    {
        question: "The concept of 'escalation' means:",
        options: [
            "Small conflicts build into larger ones over time",
            "Britain became weaker as time went on",
            "Colonists immediately wanted war after the first conflict",
            "Events happened in random order with no connection"
        ],
        correct: 0,
        explanation: "Escalation describes how the conflict intensified over time - each British action led to stronger colonial reactions, which led to harsher British responses, creating a cycle that eventually led to war.",
        topic: "Connections"
    },
    {
        question: "Why does the ORDER of events matter when studying the causes of the Revolutionary War?",
        options: [
            "It doesn't matter - events could have happened in any order",
            "Each event built on previous tensions, showing how conflicts escalated",
            "Only the first event matters",
            "Only the last event matters"
        ],
        correct: 1,
        explanation: "The order matters because it shows escalation - how repeated grievances accumulated and peaceful attempts failed, making war seem inevitable by 1775. The pattern reveals cause-and-effect relationships.",
        topic: "Connections"
    },
    {
        question: "What connects ALL four activities (Causes of Unrest, 1776, Uncovering Loyalties, Declaration Translation)?",
        options: [
            "They all focus on military battles",
            "They all show that everyone agreed about independence",
            "They help us understand WHY colonists declared independence and whose perspectives were included vs. excluded",
            "They prove that Britain was always wrong"
        ],
        correct: 2,
        explanation: "All four activities connect to the unit's driving question: 'Whose story gets told? Whose gets left out?' They help us understand both the reasons for independence AND the voices missing from the story.",
        topic: "Connections"
    }
];

// Achievement badges with check conditions
export const badges = [
    { id: 'first_study', name: 'First Steps', icon: '👶', description: 'Complete your first study session' },
    { id: 'vocab_5', name: 'Word Explorer', icon: '📚', description: 'Master 5 vocabulary terms' },
    { id: 'vocab_all', name: 'Vocabulary Master', icon: '🎓', description: 'Master all vocabulary terms' },
    { id: 'streak_3', name: 'Dedicated Student', icon: '🔥', description: 'Study 3 days in a row' },
    { id: 'streak_7', name: 'Week Warrior', icon: '⭐', description: 'Study 7 days in a row' },
    { id: 'practice_10', name: 'Practice Pro', icon: '💪', description: 'Complete 10 practice questions' },
    { id: 'test_pass', name: 'Test Taker', icon: '✅', description: 'Score 80% or higher on a practice test' },
    { id: 'perfect_test', name: 'Perfect Score', icon: '💯', description: 'Get 100% on a practice test' },
    { id: 'study_hour', name: 'Time Traveler', icon: '⏰', description: 'Study for at least 1 hour total' },
    { id: 'timeline_master', name: 'Timeline Master', icon: '🕰️', description: 'Get perfect timeline score 3 times' }
];
