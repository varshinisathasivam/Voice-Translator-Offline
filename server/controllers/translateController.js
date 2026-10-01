const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

// ─── Language Config ──────────────────────────────────────────────────────────
const LANGUAGES = {
  en: 'English',
  ta: 'Tamil',
  hi: 'Hindi',
  fr: 'French',
  es: 'Spanish',
  de: 'German',
  ar: 'Arabic',
};

// ─── In-memory fallback for translations ─────────────────────────────────────
const inMemoryTranslations = new Map();

// ─── Curated Multi-Language Offline Dictionary ────────────────────────────────
// Key phrases across all 7 languages mapped from English
const PHRASE_DICTIONARY = {
  // Greetings & Pleasantries
  'hello': { ta: 'வணக்கம்', hi: 'नमस्ते', fr: 'Bonjour', es: 'Hola', de: 'Hallo', ar: 'مرحبا' },
  'hi': { ta: 'வணக்கம்', hi: 'नमस्ते', fr: 'Salut', es: 'Hola', de: 'Hallo', ar: 'أهلاً' },
  'good morning': { ta: 'காலை வணக்கம்', hi: 'सुप्रभात', fr: 'Bonjour', es: 'Buenos días', de: 'Guten Morgen', ar: 'صباح الخير' },
  'good afternoon': { ta: 'மதிய வணக்கம்', hi: 'शुभ दोपहर', fr: 'Bon après-midi', es: 'Buenas tardes', de: 'Guten Tag', ar: 'مساء الخير' },
  'good evening': { ta: 'மாலை வணக்கம்', hi: 'शुभ संध्या', fr: 'Bonsoir', es: 'Buenas tardes', de: 'Guten Abend', ar: 'مساء الخير' },
  'good night': { ta: 'இரவு வணக்கம்', hi: 'शुभ रात्रि', fr: 'Bonne nuit', es: 'Buenas noches', de: 'Gute Nacht', ar: 'تصبح على خير' },
  'how are you': { ta: 'நீங்கள் எப்படி இருக்கிறீர்கள்', hi: 'आप कैसे हैं', fr: 'Comment allez-vous', es: '¿Cómo estás?', de: 'Wie geht es Ihnen', ar: 'كيف حالك' },
  'how are you doing': { ta: 'எப்படி இருக்கீங்க', hi: 'आप कैसे हैं', fr: 'Comment ça va', es: '¿Cómo te va?', de: 'Wie geht es dir', ar: 'كيف تسير أمورك' },
  'i am fine': { ta: 'நான் நன்றாக இருக்கிறேன்', hi: 'मैं ठीक हूँ', fr: 'Je vais bien', es: 'Estoy bien', de: 'Mir geht es gut', ar: 'أنا بخير' },
  'i am good': { ta: 'நான் நன்றாக உள்ளேன்', hi: 'मैं ठीक हूँ', fr: 'Ça va bien', es: 'Estoy bien', de: 'Mir geht es gut', ar: 'أنا بحال جيدة' },
  'nice to meet you': { ta: 'உங்களை சந்தித்ததில் மகிழ்ச்சி', hi: 'आपसे मिलकर अच्छा लगा', fr: 'Ravi de vous rencontrer', es: 'Mucho gusto', de: 'Schön, Sie kennenzulernen', ar: 'سعدت بلقائك' },
  'goodbye': { ta: 'சென்று வருகிறேன்', hi: 'अलविदा', fr: 'Au revoir', es: 'Adiós', de: 'Auf Wiedersehen', ar: 'مع السلامة' },
  'bye': { ta: 'வருகிறேன்', hi: 'बाय', fr: 'Salut', es: 'Adiós', de: 'Tschüss', ar: 'وداعاً' },
  'see you later': { ta: 'பிறகு பார்ப்போம்', hi: 'फिर मिलेंगे', fr: 'À plus tard', es: 'Hasta luego', de: 'Bis später', ar: 'أراك لاحقاً' },

  // Politeness
  'thank you': { ta: 'நன்றி', hi: 'धन्यवाद', fr: 'Merci', es: 'Gracias', de: 'Danke', ar: 'شكراً' },
  'thank you very much': { ta: 'மிக்க நன்றி', hi: 'बहुत बहुत धन्यवाद', fr: 'Merci beaucoup', es: 'Muchas gracias', de: 'Vielen Dank', ar: 'شكراً جزيلاً' },
  'thanks': { ta: 'நன்றி', hi: 'धन्यवाद', fr: 'Merci', es: 'Gracias', de: 'Danke', ar: 'شكراً' },
  'you are welcome': { ta: 'நல்வரவு', hi: 'आपका स्वागत है', fr: 'De rien', es: 'De nada', de: 'Gern geschehen', ar: 'على الرحب والسعة' },
  'welcome': { ta: 'வரவேற்கிறோம்', hi: 'स्वागत है', fr: 'Bienvenue', es: 'Bienvenido', de: 'Willkommen', ar: 'أهلاً وسهلاً' },
  'please': { ta: 'தயவுசெய்து', hi: 'कृपया', fr: "S'il vous plaît", es: 'Por favor', de: 'Bitte', ar: 'من فضلك' },
  'sorry': { ta: 'மன்னிக்கவும்', hi: 'माफ़ कीजिये', fr: 'Désolé', es: 'Lo siento', de: 'Entschuldigung', ar: 'آسف' },
  'excuse me': { ta: 'மன்னிக்கவும்', hi: 'क्षमा करें', fr: 'Excusez-moi', es: 'Disculpe', de: 'Entschuldigen Sie', ar: 'معذرة' },
  'yes': { ta: 'ஆம்', hi: 'हाँ', fr: 'Oui', es: 'Sí', de: 'Ja', ar: 'نعم' },
  'no': { ta: 'இல்லை', hi: 'नहीं', fr: 'Non', es: 'No', de: 'Nein', ar: 'لا' },
  'okay': { ta: 'சரி', hi: 'ठीक है', fr: "D'accord", es: 'De acuerdo', de: 'In Ordnung', ar: 'حسناً' },
  'ok': { ta: 'சரி', hi: 'ठीक है', fr: "D'accord", es: 'Vale', de: 'Okay', ar: 'حسناً' },

  // Common Questions
  'what is your name': { ta: 'உங்கள் பெயர் என்ன', hi: 'आपका नाम क्या है', fr: 'Comment vous appelez-vous', es: '¿Cómo te llamas?', de: 'Wie heißen Sie', ar: 'ما اسمك' },
  'my name is': { ta: 'என் பெயர்', hi: 'मेरा नाम है', fr: 'Je m’appelle', es: 'Mi nombre es', de: 'Mein Name ist', ar: 'اسمي' },
  'where are you': { ta: 'நீங்கள் எங்கே இருக்கிறீர்கள்', hi: 'आप कहाँ हैं', fr: 'Où êtes-vous', es: '¿Dónde estás?', de: 'Wo bist du', ar: 'أين أنت' },
  'where is the bathroom': { ta: 'கழிப்பறை எங்கே உள்ளது', hi: 'शौचालय कहाँ है', fr: 'Où sont les toilettes', es: '¿Dónde está el baño?', de: 'Wo ist die Toilette', ar: 'أين الحمام' },
  'where is the hospital': { ta: 'மருத்துவமனை எங்கே உள்ளது', hi: 'अस्पताल कहाँ है', fr: "Où est l'hôpital", es: '¿Dónde está el hospital?', de: 'Wo ist das Krankenhaus', ar: 'أين المستشفى' },
  'where is the nearest hospital': { ta: 'அருகிலுள்ள மருத்துவமனை எங்கே', hi: 'निकटतम अस्पताल कहाँ है', fr: "Où se trouve l'hôpital le plus proche", es: '¿Dónde está el hospital más cercano?', de: 'Wo ist das nächste Krankenhaus', ar: 'أين أقرب مستشفى' },
  'where is': { ta: 'எங்கே உள்ளது', hi: 'कहाँ है', fr: 'Où est', es: '¿Dónde está', de: 'Wo ist', ar: 'أين' },
  'how much': { ta: 'எவ்வளவு', hi: 'कितना', fr: 'Combien', es: '¿Cuánto cuesta?', de: 'Wie viel', ar: 'بكم هذا' },
  'how much is this': { ta: 'இதன் விலை எவ்வளவு', hi: 'यह कितने का है', fr: 'Combien coûte ceci', es: '¿Cuánto cuesta esto?', de: 'Wie viel kostet das', ar: 'كم سعر هذا' },
  'can you help me': { ta: 'எனக்கு உதவ முடியுமா', hi: 'क्या आप मेरी मदद कर सकते हैं', fr: 'Pouvez-vous m’aider', es: '¿Puedes ayudarme?', de: 'Können Sie mir helfen', ar: 'هل يمكنك مساعدتي' },
  'i need help': { ta: 'எனக்கு உதவி தேவை', hi: 'मुझे मदद चाहिए', fr: "J'ai besoin d'aide", es: 'Necesito ayuda', de: 'Ich brauche Hilfe', ar: 'أحتاج مساعدة' },
  'do you speak english': { ta: 'நீங்கள் ஆங்கிலம் பேசுவீர்களா', hi: 'क्या आप अंग्रेज़ी बोलते हैं', fr: 'Parlez-vous anglais', es: '¿Hablas inglés?', de: 'Sprechen Sie Englisch', ar: 'هل تتحدث الإنجليزية' },
  'i understand': { ta: 'எனக்கு புரிகிறது', hi: 'मैं समझता हूँ', fr: 'Je comprends', es: 'Entiendo', de: 'Ich verstehe', ar: 'أفهم' },
  'i do not understand': { ta: 'எனக்கு புரியவில்லை', hi: 'मुझे समझ नहीं आया', fr: 'Je ne comprends pas', es: 'No entiendo', de: 'Ich verstehe nicht', ar: 'لا أفهم' },
  'what': { ta: 'என்ன', hi: 'क्या', fr: 'Quoi', es: 'Qué', de: 'Was', ar: 'ماذا' },
  'where': { ta: 'எங்கே', hi: 'कहाँ', fr: 'Où', es: 'Dónde', de: 'Wo', ar: 'أين' },
  'when': { ta: 'எப்போது', hi: 'कब', fr: 'Quand', es: 'Cuándo', de: 'Wann', ar: 'متى' },
  'why': { ta: 'ஏன்', hi: 'क्यों', fr: 'Pourquoi', es: 'Por qué', de: 'Warum', ar: 'لماذا' },
  'how': { ta: 'எப்படி', hi: 'कैसे', fr: 'Comment', es: 'Cómo', de: 'Wie', ar: 'كيف' },
  'who': { ta: 'யார்', hi: 'कौन', fr: 'Qui', es: 'Quién', de: 'Wer', ar: 'من' },

  // Everyday words & essentials
  'water': { ta: 'தண்ணீர்', hi: 'पानी', fr: 'Eau', es: 'Agua', de: 'Wasser', ar: 'ماء' },
  'food': { ta: 'உணவு', hi: 'खाना', fr: 'Nourriture', es: 'Comida', de: 'Essen', ar: 'طعام' },
  'tea': { ta: 'தேநீர்', hi: 'चाय', fr: 'Thé', es: 'Té', de: 'Tee', ar: 'شاي' },
  'coffee': { ta: 'காபி', hi: 'कॉफ़ी', fr: 'Café', es: 'Café', de: 'Kaffee', ar: 'قهوة' },
  'milk': { ta: 'பால்', hi: 'दूध', fr: 'Lait', es: 'Leche', de: 'Milch', ar: 'حليب' },
  'bread': { ta: 'ரொட்டி', hi: 'रोटी', fr: 'Pain', es: 'Pan', de: 'Brot', ar: 'خبز' },
  'rice': { ta: 'அரிசி', hi: 'चावल', fr: 'Riz', es: 'Arroz', de: 'Reis', ar: 'أرز' },
  'help': { ta: 'உதவி', hi: 'मदद', fr: 'Aide', es: 'Ayuda', de: 'Hilfe', ar: 'مساعدة' },
  'doctor': { ta: 'மருத்துவர்', hi: 'डॉक्टर', fr: 'Médecin', es: 'Médico', de: 'Arzt', ar: 'طبيب' },
  'hospital': { ta: 'மருத்துவமனை', hi: 'अस्पताल', fr: 'Hôpital', es: 'Hospital', de: 'Krankenhaus', ar: 'مستشفى' },
  'medicine': { ta: 'மருந்து', hi: 'दवा', fr: 'Médicament', es: 'Medicina', de: 'Medikament', ar: 'دواء' },
  'police': { ta: 'காவல்துறை', hi: 'पुलिस', fr: 'Police', es: 'Policía', de: 'Polizei', ar: 'شرطة' },
  'emergency': { ta: 'அவசரம்', hi: 'आपातकाल', fr: 'Urgence', es: 'Emergencia', de: 'Notfall', ar: 'طوارئ' },
  'hotel': { ta: 'விடுதி', hi: 'होटल', fr: 'Hôtel', es: 'Hotel', de: 'Hotel', ar: 'فندق' },
  'airport': { ta: 'விமான நிலையம்', hi: 'हवाई अड्डा', fr: 'Aéroport', es: 'Aeropuerto', de: 'Flughafen', ar: 'مطار' },
  'train': { ta: 'ரயில்', hi: 'ट्रेन', fr: 'Train', es: 'Tren', de: 'Zug', ar: 'قطار' },
  'bus': { ta: 'பேருந்து', hi: 'बस', fr: 'Bus', es: 'Autobús', de: 'Bus', ar: 'حافلة' },
  'station': { ta: 'நிலையம்', hi: 'स्टेशन', fr: 'Gare', es: 'Estación', de: 'Bahnhof', ar: 'محطة' },
  'taxi': { ta: 'வாடகை கார்', hi: 'टैक्सी', fr: 'Taxi', es: 'Taxi', de: 'Taxi', ar: 'تاكسي' },
  'car': { ta: 'கார்', hi: 'गाड़ी', fr: 'Voiture', es: 'Coche', de: 'Auto', ar: 'سيارة' },
  'friend': { ta: 'நண்பர்', hi: 'दोस्त', fr: 'Ami', es: 'Amigo', de: 'Freund', ar: 'صديق' },
  'my friend': { ta: 'என் நண்பர்', hi: 'मेरे दोस्त', fr: 'Mon ami', es: 'Mi amigo', de: 'Mein Freund', ar: 'صديقي' },
  'family': { ta: 'குடும்பம்', hi: 'परिवार', fr: 'Famille', es: 'Familia', de: 'Familie', ar: 'عائلة' },
  'mother': { ta: 'அம்மா', hi: 'माँ', fr: 'Mère', es: 'Madre', de: 'Mutter', ar: 'أم' },
  'father': { ta: 'அப்பா', hi: 'पिताजी', fr: 'Père', es: 'Padre', de: 'Vater', ar: 'أب' },
  'today': { ta: 'இன்று', hi: 'आज', fr: "Aujourd'hui", es: 'Hoy', de: 'Heute', ar: 'اليوم' },
  'tomorrow': { ta: 'நாளை', hi: 'कल', fr: 'Demain', es: 'Mañana', de: 'Morgen', ar: 'غداً' },
  'yesterday': { ta: 'நேற்று', hi: 'बीता कल', fr: 'Hier', es: 'Ayer', de: 'Gestern', ar: 'أمس' },
  'now': { ta: 'இப்போது', hi: 'अब', fr: 'Maintenant', es: 'Ahora', de: 'Jetzt', ar: 'الآن' },
  'i love you': { ta: 'நான் உன்னை காதலிக்கிறேன்', hi: 'मैं तुमसे प्यार करता हूँ', fr: 'Je t’aime', es: 'Te amo', de: 'Ich liebe dich', ar: 'أحبك' },
  'happy birthday': { ta: 'இனிய பிறந்தநாள் வாழ்த்துகள்', hi: 'जन्मदिन मुबारक', fr: 'Joyeux anniversaire', es: 'Feliz cumpleaños', de: 'Alles Gute zum Geburtstag', ar: 'عيد ميلاد سعيد' },
  'congratulations': { ta: 'வாழ்த்துகள்', hi: 'बधाई हो', fr: 'Félicitations', es: 'Felicidades', de: 'Herzlichen Glückwunsch', ar: 'تهانينا' },

  // Numbers
  'one': { ta: 'ஒன்று', hi: 'एक', fr: 'Un', es: 'Uno', de: 'Eins', ar: 'واحد' },
  'two': { ta: 'இரண்டு', hi: 'दो', fr: 'Deux', es: 'Dos', de: 'Zwei', ar: 'اثنان' },
  'three': { ta: 'மூன்று', hi: 'तीन', fr: 'Trois', es: 'Tres', de: 'Drei', ar: 'ثلاثة' },
  'four': { ta: 'நான்கு', hi: 'चार', fr: 'Quatre', es: 'Cuatro', de: 'Vier', ar: 'أربعة' },
  'five': { ta: 'ஐந்து', hi: 'पाँच', fr: 'Cinq', es: 'Cinco', de: 'Fünf', ar: 'خمسة' },
  'six': { ta: 'ஆறு', hi: 'छह', fr: 'Six', es: 'Seis', de: 'Sechs', ar: 'ستة' },
  'seven': { ta: 'ஏழு', hi: 'सात', fr: 'Sept', es: 'Siete', de: 'Sieben', ar: 'سبعة' },
  'eight': { ta: 'எட்டு', hi: 'आठ', fr: 'Huit', es: 'Ocho', de: 'Acht', ar: 'ثمانية' },
  'nine': { ta: 'ஒன்பது', hi: 'नौ', fr: 'Neuf', es: 'Nueve', de: 'Neun', ar: 'تسعة' },
  'ten': { ta: 'பத்து', hi: 'दस', fr: 'Dix', es: 'Diez', de: 'Zehn', ar: 'عشرة' },

  // Directions & Movement
  'left': { ta: 'இடது', hi: 'बाएँ', fr: 'Gauche', es: 'Izquierda', de: 'Links', ar: 'يسار' },
  'right': { ta: 'வலது', hi: 'दाएँ', fr: 'Droite', es: 'Derecha', de: 'Rechts', ar: 'يمين' },
  'straight': { ta: 'நேராக', hi: 'सीधे', fr: 'Tout droit', es: 'Derecho', de: 'Geradeaus', ar: 'مستقيم' },
  'stop': { ta: 'நில்லுங்கள்', hi: 'रुकिए', fr: 'Arrêtez', es: 'Deténgase', de: 'Halt', ar: 'توقف' },
  'go': { ta: 'போங்கள்', hi: 'जाइए', fr: 'Allez', es: 'Vaya', de: 'Gehen', ar: 'اذهب' },
  'come': { ta: 'வாருங்கள்', hi: 'आइए', fr: 'Venez', es: 'Ven', de: 'Kommen', ar: 'تعال' },
  'here': { ta: 'இங்கே', hi: 'यहाँ', fr: 'Ici', es: 'Aquí', de: 'Hier', ar: 'هنا' },
  'there': { ta: 'அங்கே', hi: 'वहाँ', fr: 'Là-bas', es: 'Allí', de: 'Dort', ar: 'هناك' },
  'near': { ta: 'அருகில்', hi: 'पास', fr: 'Près', es: 'Cerca', de: 'Nah', ar: 'قريب' },
  'far': { ta: 'தொலைவில்', hi: 'दूर', fr: 'Loin', es: 'Lejos', de: 'Weit', ar: 'بعيد' },

  // Places & Travel
  'school': { ta: 'பள்ளி', hi: 'स्कूल', fr: 'École', es: 'Escuela', de: 'Schule', ar: 'مدرسة' },
  'office': { ta: 'அலுவலகம்', hi: 'कार्यालय', fr: 'Bureau', es: 'Oficina', de: 'Büro', ar: 'مكتب' },
  'home': { ta: 'வீடு', hi: 'घर', fr: 'Maison', es: 'Casa', de: 'Zuhause', ar: 'بيت' },
  'house': { ta: 'வீடு', hi: 'घर', fr: 'Maison', es: 'Casa', de: 'Haus', ar: 'منزل' },
  'market': { ta: 'சந்தை', hi: 'बाज़ार', fr: 'Marché', es: 'Mercado', de: 'Markt', ar: 'سوق' },
  'shop': { ta: 'கடை', hi: 'दुकान', fr: 'Boutique', es: 'Tienda', de: 'Geschäft', ar: 'متجر' },
  'road': { ta: 'சாலை', hi: 'सड़क', fr: 'Route', es: 'Carretera', de: 'Straße', ar: 'طريق' },

  // Essentials & Expressions
  'i am hungry': { ta: 'எனக்கு பசிக்கிறது', hi: 'मुझे भूख लगी है', fr: "J'ai faim", es: 'Tengo hambre', de: 'Ich habe Hunger', ar: 'أنا جائع' },
  'i am thirsty': { ta: 'எனக்கு தாகமாக இருக்கிறது', hi: 'मुझे प्यास लगी है', fr: "J'ai soif", es: 'Tengo sed', de: 'Ich habe Durst', ar: 'أنا عطشان' },
  'what time is it': { ta: 'இப்போது நேரம் என்ன', hi: 'क्या समय हुआ है', fr: 'Quelle heure est-il', es: '¿Qué hora es?', de: 'Wie spät ist es', ar: 'كم الساعة' },
  'i don\'t know': { ta: 'எனக்கு தெரியாது', hi: 'मुझे नहीं पता', fr: 'Je ne sais pas', es: 'No sé', de: 'Ich weiß nicht', ar: 'لا أعرف' },
  'i know': { ta: 'எனக்கு தெரியும்', hi: 'मुझे पता है', fr: 'Je sais', es: 'Lo sé', de: 'Ich weiß', ar: 'أنا أعلم' },
  'speak slowly': { ta: 'மெதுவாக பேசுங்கள்', hi: 'धीरे बोलो', fr: 'Parlez lentement', es: 'Hable despacio', de: 'Sprechen Sie langsam', ar: 'تحدث ببطء' },
  'call the police': { ta: 'காவல்துறையை அழைக்கவும்', hi: 'पुलिस को बुलाओ', fr: 'Appelez la police', es: 'Llame a la policía', de: 'Rufen Sie die Polizei', ar: 'اتصل بالشرطة' },
  'call an ambulance': { ta: 'ஆம்புலன்ஸை அழைக்கவும்', hi: 'एम्बुलेंस बुलाओ', fr: 'Appelez une ambulance', es: 'Llame a una ambulancia', de: 'Rufen Sie einen Krankenwagen', ar: 'اتصل بالإسعاف' },
  'i need a doctor': { ta: 'எனக்கு ஒரு மருத்துவர் தேவை', hi: 'मुझे डॉक्टर की ज़रूरत है', fr: "J'ai besoin d'un médecin", es: 'Necesito un médico', de: 'Ich brauche einen Arzt', ar: 'أحتاج إلى طبيب' },
  'take care': { ta: 'கவனமாக இருங்கள்', hi: 'अपना ख्याल रखें', fr: 'Prenez soin de vous', es: 'Cuídate', de: 'Pass auf dich auf', ar: 'اعتن بنفسك' },
  'see you soon': { ta: 'விரைவில் சந்திப்போம்', hi: 'जल्द ही मिलेंगे', fr: 'À bientôt', es: 'Hasta pronto', de: 'Bis bald', ar: 'أراك قريباً' },
  'good': { ta: 'நல்லது', hi: 'अच्छा', fr: 'Bon', es: 'Bueno', de: 'Gut', ar: 'جيد' },
  'bad': { ta: 'மோசமானது', hi: 'बुरा', fr: 'Mauvais', es: 'Malo', de: 'Schlecht', ar: 'سيء' },
  'big': { ta: 'பெரியது', hi: 'बड़ा', fr: 'Grand', es: 'Grande', de: 'Groß', ar: 'كبير' },
  'small': { ta: 'சிறியது', hi: 'छोटा', fr: 'Petit', es: 'Pequeño', de: 'Klein', ar: 'صغير' },
  'money': { ta: 'பணம்', hi: 'पैसा', fr: 'Argent', es: 'Dinero', de: 'Geld', ar: 'مال' },
  'time': { ta: 'நேரம்', hi: 'समय', fr: 'Temps', es: 'Tiempo', de: 'Zeit', ar: 'وقت' },
};

// ─── Offline translation algorithm ───────────────────────────────────────────
const offlineTranslate = (text, from, to) => {
  if (from === to) return { translated: text, confidence: 100 };

  const clean = text.trim();
  const lower = clean.toLowerCase();
  // Strip trailing/leading punctuation for robust matching
  const normalized = lower.replace(/[.,?!;:¿¡'"_]/g, '').trim();

  // 1. Direct phrase lookup if source is English
  if (from === 'en') {
    const match = PHRASE_DICTIONARY[lower] || PHRASE_DICTIONARY[normalized];
    if (match && match[to]) {
      return { translated: match[to], confidence: 99 };
    }
  }

  // 2. Direct phrase lookup if target is English
  if (to === 'en') {
    for (const [enKey, translations] of Object.entries(PHRASE_DICTIONARY)) {
      const srcText = translations[from]?.toLowerCase();
      if (srcText && (srcText === lower || srcText === normalized)) {
        return { translated: enKey.charAt(0).toUpperCase() + enKey.slice(1), confidence: 99 };
      }
    }
  }

  // 3. Pivot through English (e.g. ta -> hi, fr -> es)
  if (from !== 'en' && to !== 'en') {
    for (const [enKey, translations] of Object.entries(PHRASE_DICTIONARY)) {
      const srcText = translations[from]?.toLowerCase();
      if (srcText && (srcText === lower || srcText === normalized) && translations[to]) {
        return { translated: translations[to], confidence: 96 };
      }
    }
  }

  // 4. Multi-word phrase replacement (longest phrases first)
  let replaced = clean;
  let matches = 0;
  if (from === 'en') {
    const sortedKeys = Object.keys(PHRASE_DICTIONARY).sort((a, b) => b.length - a.length);
    for (const phrase of sortedKeys) {
      const targetWord = PHRASE_DICTIONARY[phrase][to];
      if (targetWord) {
        const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
        if (regex.test(replaced)) {
          replaced = replaced.replace(regex, targetWord);
          matches++;
        }
      }
    }
  } else if (to === 'en') {
    for (const [enKey, translations] of Object.entries(PHRASE_DICTIONARY)) {
      const phrase = translations[from];
      if (phrase && replaced.includes(phrase)) {
        replaced = replaced.split(phrase).join(enKey);
        matches++;
      }
    }
  }

  if (matches > 0) {
    return { translated: replaced, confidence: 85 };
  }

  // 5. Friendly fallback
  const langName = LANGUAGES[to] || to;
  return {
    translated: `[${langName}]: ${clean}`,
    confidence: 60,
  };
};

// ─── Online translation helper with timeout ──────────────────────────────────
const onlineTranslate = async (text, from, to) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}&de=voicetranslate_app@gmail.com`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();

    const translatedText = data?.responseData?.translatedText;
    if (
      translatedText &&
      typeof translatedText === 'string' &&
      translatedText.trim() !== '' &&
      translatedText.toLowerCase().trim() !== text.toLowerCase().trim() &&
      !translatedText.includes('MYMEMORY WARNING') &&
      !translatedText.includes('QUERY LENGTH LIMIT')
    ) {
      return {
        translated: translatedText.trim(),
        confidence: Math.round((data.responseData.match || 0.95) * 100),
      };
    }
    return null;
  } catch (_) {
    clearTimeout(timeoutId);
    return null;
  }
};

const isDbConnected = () => mongoose.connection.readyState === 1;

// ─── Translate Controller ─────────────────────────────────────────────────────
exports.translate = async (req, res) => {
  const {
    text,
    sourceLanguage = 'en',
    targetLanguage,
    inputType = 'text',
    audioUrl = null,
    duration = 0,
  } = req.body;

  if (!text || !targetLanguage) {
    return res.status(400).json({ success: false, message: 'text and targetLanguage are required' });
  }

  if (sourceLanguage === targetLanguage) {
    return res.status(400).json({ success: false, message: 'Source and target languages must be different' });
  }

  let finalTranslation = null;
  let finalConfidence = 90;

  // 1. Try curated exact dictionary first for speed & accuracy
  const offlineCheck = offlineTranslate(text, sourceLanguage, targetLanguage);
  if (offlineCheck.confidence >= 95) {
    finalTranslation = offlineCheck.translated;
    finalConfidence = offlineCheck.confidence;
  } else {
    // 2. Try online translation for rich sentences
    const online = await onlineTranslate(text, sourceLanguage, targetLanguage);
    if (online) {
      finalTranslation = online.translated;
      finalConfidence = online.confidence;
    } else {
      // 3. Fall back to offline dictionary
      finalTranslation = offlineCheck.translated;
      finalConfidence = offlineCheck.confidence;
    }
  }

  const result = {
    originalText: text,
    translatedText: finalTranslation,
    sourceLanguage,
    targetLanguage,
    sourceLanguageName: LANGUAGES[sourceLanguage] || sourceLanguage,
    targetLanguageName: LANGUAGES[targetLanguage] || targetLanguage,
    confidence: finalConfidence,
    inputType,
    audioUrl,
    duration: Number(duration) || 0,
    isFavorite: false,
  };

  // Save to DB or in-memory
  if (req.user) {
    const userId = String(req.user._id || req.user.id);

    if (isDbConnected()) {
      try {
        const Translation = require('../models/Translation');
        const saved = await Translation.create({ userId, ...result });
        try {
          const User = require('../models/User');
          await User.findByIdAndUpdate(userId, { $inc: { translationCount: 1 } });
        } catch (_) {}
        return res.json({ success: true, data: saved });
      } catch (_) {
        // Fall through to in-memory
      }
    }

    // In-memory store
    const id = uuidv4();
    const record = {
      id,
      _id: id,
      userId,
      ...result,
      createdAt: new Date(),
    };

    if (!inMemoryTranslations.has(userId)) inMemoryTranslations.set(userId, []);
    inMemoryTranslations.get(userId).unshift(record);

    return res.json({ success: true, data: record });
  }

  res.json({
    success: true,
    data: { id: uuidv4(), _id: uuidv4(), ...result, createdAt: new Date() },
  });
};

// ─── Get Languages ────────────────────────────────────────────────────────────
exports.getLanguages = (req, res) => {
  const langs = Object.entries(LANGUAGES).map(([code, name]) => ({ code, name }));
  res.json({ success: true, data: langs });
};

// Export for history controller
exports.inMemoryTranslations = inMemoryTranslations;
