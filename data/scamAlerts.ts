import { ScamAlertData } from '../types';

export const scamAlertData: ScamAlertData = {
  // --- TASKS ---
  'apply-for-pan': [
    {
      message: { 
        en: 'You do not need an agent for this. You can do it yourself.', 
        hi: '⚠️ इस काम के लिए एजेंट की जरूरत नहीं है। आप यह खुद कर सकते हैं।' 
      },
      severity: 'warning'
    },
    {
      message: { 
        en: 'Only use the official government websites. Do not use fake sites.', 
        hi: '⚠️ सिर्फ सरकारी वेबसाइट का ही इस्तेमाल करें। नकली साइटों से बचें।' 
      },
      severity: 'critical'
    }
  ],
  'open-bank-account': [
     {
      message: { 
        en: 'Opening a basic savings account is free. Do not pay anyone.', 
        hi: '⚠️ बेसिक बचत खाता खोलना मुफ़्त है। किसी को पैसे न दें।' 
      },
      severity: 'critical'
    }
  ],
  'apply-for-driving-license': [
     {
      message: { 
        en: 'Beware of agents at the RTO who promise a license without a test for money.', 
        hi: '⚠️ RTO में उन एजेंटों से सावधान रहें जो पैसे के बदले बिना टेस्ट के लाइसेंस का वादा करते हैं।' 
      },
      severity: 'critical'
    }
  ],

  // --- SCHEMES ---
  'sukanya-samriddhi': [
    {
      message: { 
        en: 'There is no fee to apply for this scheme. Only the deposit amount is needed.', 
        hi: '⚠️ इस योजना के लिए कोई फीस नहीं लगती। केवल जमा राशि की आवश्यकता है।' 
      },
      severity: 'warning'
    }
  ],
  'pm-kisan': [
     {
      message: { 
        en: 'Do not pay any agent to get the money from this scheme.', 
        hi: '⚠️ इस योजना का पैसा पाने के लिए किसी एजेंट को भुगतान न करें।' 
      },
      severity: 'critical'
    }
  ],
  'pmjdy': [
    {
      message: { 
        en: 'This account is opened for free. No one can ask for money to open a Jan Dhan account.', 
        hi: '⚠️ यह खाता मुफ़्त में खोला जाता है। जन धन खाता खोलने के लिए कोई भी पैसे नहीं मांग सकता।' 
      },
      severity: 'critical'
    }
  ]
};