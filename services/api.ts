// services/api.ts
import { Task, Scheme, Locale, UserRole } from '../types';
// Instead of fetching, we import the data directly to mock the backend.
import { tasks as allTasks } from '../data/tasks'; 
import { schemes as allSchemes } from '../data/schemes';
import { locales } from '../data/locales';
import { GoogleGenAI } from "@google/genai";
import { searchLifeTaskOnline, searchSchemeOnline } from './geminiService';

// This is our in-memory "database" that can be updated.
let schemesDB = [...allSchemes];
let tasksDB = [...allTasks];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface TasksResponse {
    data: Partial<Task>[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
    };
}

interface SchemesResponse {
    data: Scheme[];
}

// --- Life Tasks ---
export const fetchTasks = async (filters: { category?: string; query?: string; role?: UserRole | 'All' }, isSimpleMode: boolean): Promise<TasksResponse> => {
    await delay(300); // Simulate network latency

    let filteredTasks = [...tasksDB];

    if (filters.category && filters.category !== 'All') {
        filteredTasks = filteredTasks.filter(task => task.category === filters.category);
    }

    if (filters.role && filters.role !== 'general' && filters.role !== 'All') {
       filteredTasks = filteredTasks.filter(task => task.relevantFor?.includes(filters.role as UserRole));
    }
    
    if (filters.query) {
        const query = filters.query.toLowerCase();
        filteredTasks = filteredTasks.filter(task => 
            task.title.toLowerCase().includes(query) ||
            task.purpose.toLowerCase().includes(query)
        );
    }

    const responseData = filteredTasks.map(task => {
        if (isSimpleMode) {
          return { id: task.id, title: task.title, purpose: task.purpose, category: task.category, relevantFor: task.relevantFor };
        }
        return {
            id: task.id,
            title: task.title,
            purpose: task.purpose,
            timeRequired: task.timeRequired,
            difficulty: task.difficulty,
            category: task.category,
            relevantFor: task.relevantFor,
        };
    });

    const pageNum = 1;
    const limitNum = 100;
    const paginatedData = responseData.slice(0, limitNum);

    return Promise.resolve({
        data: paginatedData,
        pagination: {
            currentPage: pageNum,
            totalPages: 1,
            totalItems: responseData.length
        }
    });
};

export const fetchTaskById = async (id: string, isSimpleMode: boolean): Promise<Task> => {
    await delay(300);
    const task = tasksDB.find(t => t.id === id);

    if (!task) {
        return Promise.reject(new Error('Task not found'));
    }

    return Promise.resolve(task);
};

export const updateTasksOnServer = async (isSimpleMode: boolean): Promise<Partial<Task>[]> => {
    await delay(1500);

    const newTask: Task = {
        id: `new-task-${Date.now()}`,
        title: "File an RTI (Right to Information)",
        purpose: "To request information from any public authority in India.",
        timeRequired: "30 Days",
        difficulty: "Medium",
        category: "Law",
        overview: {
            what: "The Right to Information Act empowers citizens to question the government and its working.",
            why: "It promotes transparency and accountability in the working of every public authority.",
            who: "Any citizen of India can file an RTI application."
        },
        steps: [],
        commonMistakes: ["Asking vague questions.", "Not paying the required fee."],
        officialLinks: [{ title: "RTI Online Portal", url: "https://rtionline.gov.in/" }],
        completionMethods: ['Online', 'Post Office'],
        relevantFor: ['general', 'working']
    };

    if (!tasksDB.some(t => t.title === newTask.title)) {
        tasksDB.unshift(newTask);
    }

    const responseData = tasksDB.map(task => {
        if (isSimpleMode) {
          return { id: task.id, title: task.title, purpose: task.purpose, category: task.category, relevantFor: task.relevantFor };
        }
        return task;
    });

    return Promise.resolve(responseData);
};


// --- Government Schemes ---
export const fetchSchemes = async (filters: { type: string, state?: string, status: string, category: string, query?: string }, sort: string): Promise<SchemesResponse> => {
    await delay(300);
    
    let result = [...schemesDB];

    if (filters.type && filters.type !== 'All') {
        result = result.filter(s => s.type === filters.type);
        if (filters.type === 'State' && filters.state && filters.state !== 'All') {
             result = result.filter(s => s.state === filters.state);
        }
    }

    if (filters.status && filters.status !== 'All') {
        result = result.filter(s => s.status === filters.status);
    }
    if (filters.category && filters.category !== 'All') {
        result = result.filter(s => s.category === filters.category);
    }
    
    if (filters.query) {
        const lowerQuery = filters.query.toLowerCase();
        result = result.filter(s =>
            s.name.toLowerCase().includes(lowerQuery) ||
            s.description.toLowerCase().includes(lowerQuery)
        );
    }

    switch (sort) {
        case 'Oldest':
            result.sort((a, b) => new Date(a.launchDate).getTime() - new Date(b.launchDate).getTime());
            break;
        case 'Deadline Nearest':
            result.sort((a, b) => {
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return a.deadline.localeCompare(b.deadline);
            });
            break;
        case 'Newest':
        default:
            result.sort((a, b) => new Date(b.launchDate).getTime() - new Date(a.launchDate).getTime());
            break;
    }

    return Promise.resolve({ data: result });
};

export const fetchSchemeById = async (id: string): Promise<Scheme> => {
    await delay(300);
    const scheme = schemesDB.find(s => s.id === id);
    if (scheme) {
        return Promise.resolve(scheme);
    } else {
        return Promise.reject(new Error('Scheme not found'));
    }
};

// This function simulates fetching new data and updating our "database".
export const updateSchemesOnServer = async (): Promise<Scheme[]> => {
    await delay(1500);
    
    // Simulate finding a new scheme from an official portal
    const newScheme: Scheme = {
        id: `new-scheme-${Date.now()}`,
        name: "Digital India FutureSkills Prime",
        category: "Career",
        type: "Central",
        status: "Active",
        launchDate: new Date().toISOString().split('T')[0],
        description: "A scheme to upskill IT professionals in emerging technologies like AI, Big Data, and Cybersecurity.",
        eligibility: ["Indian citizens in the IT field", "Students pursuing relevant degrees"],
        benefits: ["Subsidized certification courses", "Access to a digital learning platform"],
        documents: ["Aadhaar Card", "Proof of employment or student ID"],
        applicationProcess: "Register and apply through the FutureSkills Prime portal.",
        officialLink: "#",
        completionMethods: ['Online']
    };
    
    // Add the new scheme to the top of our in-memory DB, avoiding duplicates
    if (!schemesDB.some(s => s.name === newScheme.name)) {
        schemesDB.unshift(newScheme);
    }
    
    return Promise.resolve([...schemesDB]);
};

// --- Chatbot ---
const API_KEY = process.env.API_KEY;

const getKeywords = (text: string) => text.toLowerCase().replace(/[?.,]/g, '').split(' ').filter(word => word.length > 2 && !['how', 'to', 'what', 'is', 'a', 'the', 'for', 'an', 'mein', 'hai', 'kaise', 'kare', 'kya'].includes(word));

export const postToChatbot = async (query: string, page_context: string, language: string): Promise<string> => {
    if (!API_KEY) {
        return "API Key not configured. Chatbot is disabled.";
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });
    let internalData: string | null = null;
    let pageLink: string | null = null;
    let source: 'internal' | 'external' = 'internal';

    // 1. Internal Knowledge Store Search
    const queryKeywords = getKeywords(query);

    const matchedTask = allTasks.find(task => {
        const titleKeywords = getKeywords(task.title);
        const idKeywords = getKeywords(task.id.replace(/-/g, ' ')); 
        const allTaskKeywords = [...titleKeywords, ...idKeywords];
        return queryKeywords.some(qWord => allTaskKeywords.some(tWord => tWord.includes(qWord) || qWord.includes(tWord)));
    });

    if (matchedTask) {
        internalData = `
            Task: ${matchedTask.title}
            Purpose: ${matchedTask.purpose}
            Steps: ${matchedTask.steps.map((s, i) => `${i+1}. ${s.title}: ${s.description}`).join('\n')}
            Official Link: ${matchedTask.officialLinks[0].url}
        `;
        pageLink = `/#/task/${matchedTask.id}`;
    } else {
        const matchedScheme = allSchemes.find(scheme => {
            const nameKeywords = getKeywords(scheme.name);
            const idKeywords = getKeywords(scheme.id.replace(/-/g, ' '));
            const acronym = scheme.name.split(' ').filter(word => word.length > 1 && word[0] === word[0].toUpperCase()).map(w => w[0]).join('');
            const allSchemeKeywords = [...nameKeywords, ...idKeywords, acronym.toLowerCase()];
            return queryKeywords.some(qWord => allSchemeKeywords.some(sWord => sWord.includes(qWord) || qWord.includes(sWord)));
        });
        
        if (matchedScheme) {
            internalData = `
                Scheme: ${matchedScheme.name}
                Description: ${matchedScheme.description}
                Benefits: ${matchedScheme.benefits.join('. ')}
                Eligibility: ${matchedScheme.eligibility.join('. ')}
                Official Link: ${matchedScheme.officialLink}
            `;
            pageLink = `/#/scheme/${matchedScheme.id}`;
        }
    }

    let groundingData = internalData;
    let sourceMessage = "";
    
    // 2. External Search Layer (Fallback)
    if (!groundingData) {
        source = 'external';
        sourceMessage = "I couldn't find this in Saarthi's database, so I searched online for you from trusted sources. Here is a summary:\n\n";

        if (query.toLowerCase().includes('scheme') || query.toLowerCase().includes('yojana')) {
            groundingData = await searchSchemeOnline(query);
        } else {
            groundingData = await searchLifeTaskOnline(query);
        }
    }
    
    if (!groundingData) {
        return "I'm sorry, I couldn't find any information about that. Please try asking in a different way.";
    }

    // 3. AI Processing Layer (Gemini for Simplification)
    const systemInstruction = `You are Saarthi, a friendly AI assistant for an Indian life guidance website. Your job is to SUMMARIZE AND SIMPLIFY the provided information. 
- NEVER add new facts or links not present in the provided data.
- Respond in very simple, clear language. Use lists for steps.
- Be polite, reassuring, and encouraging.
- Your response MUST be in **${language || 'English'}**. If the user uses Hinglish, respond in simple Hindi.
- Current Page Context: The user is on a page about "${page_context}".
- If a "Page Link on Saarthi" is provided in the user prompt and it is not 'None', you MUST include a link to it at the end of your main answer, on a new line.
- For English, the link text should be "Click here for full details on Saarthi.".
- For Hindi or Hinglish, the link text should be "पूरी जानकारी के लिए यहाँ क्लिक करें।".
- Format the final link in Markdown: [link text](the_link_url).
- After your main answer, add the trust note on a new line. If you added a page link, the trust note should come after the link. The trust note for Hindi/Hinglish is "यह जानकारी विश्वसनीय स्रोतों से ली गई है।" and for English is "This information is from trusted sources."`;
    
    const finalPrompt = `
        User's question: "${query}"
        
        Information for answer (Source: ${source}):
        ---
        ${groundingData}
        ---
        
        Page Link on Saarthi: ${pageLink || 'None'}
        
        Provide a simple, helpful answer to the user's question in ${language}. ${sourceMessage ? 'Start your response with: "' + sourceMessage + '"' : ''}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: finalPrompt,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        // Append trust note if not already there, based on language
        let responseText = response.text?.trim() || "I'm sorry, I couldn't process that. Could you please ask in a different way?";
        const hiTrustNote = "यह जानकारी विश्वसनीय स्रोतों से ली गई है।";
        const enTrustNote = "This information is from trusted sources.";
        
        if (!responseText.includes(hiTrustNote) && !responseText.includes(enTrustNote)) {
            if (language.toLowerCase() === 'hindi' || language.toLowerCase() === 'hinglish') {
                 responseText += `\n\n_${hiTrustNote}_`;
            } else {
                 responseText += `\n\n_${enTrustNote}_`;
            }
        }
        
        return responseText;

    } catch (error) {
        console.error("Error with chatbot final processing:", error);
        return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
    }
};

// --- Language ---
export const fetchLocales = async (): Promise<Locale> => {
    await delay(50);
    return Promise.resolve(locales);
};