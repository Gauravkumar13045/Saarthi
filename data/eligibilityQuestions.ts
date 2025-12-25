import { EligibilityData } from '../types';

export const eligibilityData: EligibilityData = {
  // --- TASKS ---
  'apply-for-pan': {
    questions: [
      {
        id: 'q1',
        question: { en: 'Are you an Indian citizen?', hi: 'क्या आप भारतीय नागरिक हैं?' },
        expects: true,
        failReason: { en: 'Only Indian citizens can apply through this process.', hi: 'केवल भारतीय नागरिक ही इस प्रक्रिया से आवेदन कर सकते हैं।' }
      },
      {
        id: 'q2',
        question: { en: 'Do you already have a PAN card?', hi: 'क्या आपके पास पहले से पैन कार्ड है?' },
        expects: false,
        failReason: { en: 'You can only hold one PAN card. You may need to apply for a correction or reprint.', hi: 'आप केवल एक ही पैन कार्ड रख सकते हैं। आपको सुधार या पुनर्मुद्रण के लिए आवेदन करना पड़ सकता है।' }
      },
      {
        id: 'q3',
        question: { en: 'Do you have a valid Aadhaar card?', hi: 'क्या आपके पास वैध आधार कार्ड है?' },
        expects: true,
        failReason: { en: 'Aadhaar is required for online PAN application.', hi: 'ऑनलाइन पैन आवेदन के लिए आधार आवश्यक है।' }
      }
    ]
  },

  // --- SCHEMES ---
  'sukanya-samriddhi': {
    questions: [
       {
        id: 'q1',
        question: { en: 'Are you a parent or legal guardian of a girl child?', hi: 'क्या आप एक बालिका के माता-पिता या कानूनी अभिभावक हैं?' },
        expects: true,
        failReason: { en: 'Only parents or legal guardians can open an SSY account.', hi: 'केवल माता-पिता या कानूनी अभिभावक ही SSY खाता खोल सकते हैं।' }
      },
      {
        id: 'q2',
        question: { en: 'Is the girl child less than 10 years old?', hi: 'क्या बालिका की आयु 10 वर्ष से कम है?' },
        expects: true,
        failReason: { en: 'The scheme is only for girl children below the age of 10.', hi: 'यह योजना केवल 10 वर्ष से कम आयु की बालिकाओं के लिए है।' }
      },
      {
        id: 'q3',
        question: { en: 'Are you an Indian resident?', hi: 'क्या आप एक भारतीय निवासी हैं?' },
        expects: true,
        failReason: { en: 'This scheme is for resident Indians only.', hi: 'यह योजना केवल निवासी भारतीयों के लिए है।' }
      }
    ]
  },
   'atal-pension': {
    questions: [
       {
        id: 'q1',
        question: { en: 'Are you between 18 and 40 years old?', hi: 'क्या आपकी उम्र 18 से 40 साल के बीच है?' },
        expects: true,
        failReason: { en: 'You must be between 18 and 40 years of age to join this scheme.', hi: 'इस योजना में शामिल होने के लिए आपकी आयु 18 से 40 वर्ष के बीच होनी चाहिए।' }
      },
      {
        id: 'q2',
        question: { en: 'Do you have a savings bank account?', hi: 'क्या आपके पास बचत बैंक खाता है?' },
        expects: true,
        failReason: { en: 'A savings bank account is mandatory for this scheme.', hi: 'इस योजना के लिए बचत बैंक खाता अनिवार्य है।' }
      },
      {
        id: 'q3',
        question: { en: 'Are you an income taxpayer?', hi: 'क्या आप आयकर दाता हैं?' },
        expects: false,
        failReason: { en: 'While open to all, this scheme is primarily focused on the unorganized sector who are not income taxpayers.', hi: 'हालांकि यह सभी के लिए खुला है, यह योजना मुख्य रूप से असंगठित क्षेत्र पर केंद्रित है जो आयकर दाता नहीं हैं।' }
      }
    ]
  }
};
