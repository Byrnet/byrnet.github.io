const { useState, useEffect } = React;

const ServiceCard = ({ icon, title, paragraphs }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Combine all paragraphs into one text for processing
  const fullText = paragraphs.join(" ");
  // Split by sentence endings (. ! ?). This is a simple approximation.
  const sentences = fullText.match(/[^.!?]+[.!?]+/g) || [fullText];
  
  const previewText = sentences.slice(0, 2).join(" ");
  const restText = sentences.slice(2).join(" ");

  return (
    <article className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-2xl mb-4">{icon}</div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <div className="text-sm text-gray-600 mt-2 flex-grow">
        <p>{previewText}</p>
        {isExpanded && (
          <div className="mt-2 animate-fadeIn">
             <p>{restText}</p>
          </div>
        )}
      </div>
      {sentences.length > 2 && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-indigo-600 text-sm font-medium mt-4 self-start hover:underline focus:outline-none"
        >
          {isExpanded ? "Свернуть" : "Далее..."}
        </button>
      )}
    </article>
  );
};

function AuditLanding() {
  const [fileName, setFileName] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang, setLang] = useState('ru');

  // Form states
  const [estimateForm, setEstimateForm] = useState({ name: '', contact: '', typeIndex: 0, file: null });
  const [contactForm, setContactForm] = useState({ name: '', phone: '', details: '' });
  
  // Submission states
  const [estimateSent, setEstimateSent] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    // Check URL for language
    const path = window.location.pathname.toLowerCase();
    if (path === '/en' || path.startsWith('/en/')) {
      setLang('en');
    } else {
      setLang('ru');
    }

    // Initialize EmailJS
    if (window.emailjs && window.EMAIL_CONFIG) {
        emailjs.init(window.EMAIL_CONFIG.PUBLIC_KEY);
    }
  }, []);

  const t = window.LANDING_CONTENT[lang];
  const services = window.LANDING_SERVICES[lang] || window.LANDING_SERVICES['ru'];

  const sendEmail = (templateParams, setSentState) => {
    if (!window.EMAIL_CONFIG || window.EMAIL_CONFIG.PUBLIC_KEY === "YOUR_PUBLIC_KEY_HERE") {
        alert("EmailJS is not configured. Please set API keys in js/email_config.js");
        return;
    }

    setIsSending(true);

    emailjs.send(
        window.EMAIL_CONFIG.SERVICE_ID,
        window.EMAIL_CONFIG.TEMPLATE_ID,
        templateParams
    )
    .then((response) => {
       console.log('SUCCESS!', response.status, response.text);
       setSentState(true);
       setIsSending(false);
       setTimeout(() => setSentState(false), 5000);
    }, (err) => {
       console.log('FAILED...', err);
       alert('Failed to send email. Please try again later or contact us directly.');
       setIsSending(false);
    });
  };

  const handleEstimateSubmit = (e) => {
    e.preventDefault();
    
    const templateParams = {
        subject: t.email.estimate.subject,
        title: t.email.estimate.body_title,
        name_label: t.email.estimate.name,
        name_value: estimateForm.name,
        contact_label: t.email.estimate.contact,
        contact_value: estimateForm.contact,
        type_label: t.email.estimate.type,
        type_value: t.form.types[estimateForm.typeIndex],
        file_label: t.email.estimate.file,
        file_value: fileName || t.form.file_none,
        // Fallback for simple templates
        message: `
${t.email.estimate.body_title}
---------------------------------------------------
${t.email.estimate.name} ${estimateForm.name}
${t.email.estimate.contact} ${estimateForm.contact}
${t.email.estimate.type} ${t.form.types[estimateForm.typeIndex]}
${t.email.estimate.file} ${fileName || t.form.file_none}
---------------------------------------------------
        `
    };

    sendEmail(templateParams, setEstimateSent);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();

    const templateParams = {
        subject: t.email.contact.subject,
        title: t.email.contact.body_title,
        name_label: t.email.contact.name,
        name_value: contactForm.name,
        contact_label: t.email.contact.phone,
        contact_value: contactForm.phone,
        details_label: t.email.contact.details,
        details_value: contactForm.details,
        // Fallback for simple templates
        message: `
${t.email.contact.body_title}
---------------------------------------------------
${t.email.contact.name} ${contactForm.name}
${t.email.contact.phone} ${contactForm.phone}
${t.email.contact.details} ${contactForm.details}
---------------------------------------------------
        `
    };

    sendEmail(templateParams, setContactSent);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased">
      {/* Top navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded flex items-center justify-center text-white font-bold">A</div>
            <div>
              <div className="text-sm font-semibold">Audit & Project</div>
              <div className="text-xs text-gray-500">Оптимизация проектов | Консультации по состоянию существующих зданий и сооружений</div>
            </div>
          </div>

          <nav className="hidden md:flex gap-6 items-center text-sm">
            <a href="#services" className="hover:text-indigo-600">{t.nav.services}</a>
            <a href="#solution" className="hover:text-indigo-600">{t.nav.solution}</a>
            <a href="#cases" className="hover:text-indigo-600">{t.nav.cases}</a>
            <a href="#team" className="hover:text-indigo-600">{t.nav.team}</a>
            <a href="/calculator/" className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">{t.nav.calculate}</a>
            
            {/* Language Switcher */}
            <div className="flex items-center gap-2 ml-2 border-l pl-4">
               <a href="/en/" className={`hover:text-indigo-600 ${lang === 'en' ? 'font-bold text-indigo-600' : 'text-gray-500'}`}>EN</a>
               <span className="text-gray-300">/</span>
               <a href="/" className={`hover:text-indigo-600 ${lang === 'ru' ? 'font-bold text-indigo-600' : 'text-gray-500'}`}>RU</a>
            </div>
          </nav>

          <button 
            className="md:hidden p-2 rounded-md border"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {t.nav.menu}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t p-4 absolute top-full left-0 right-0 shadow-lg z-50">
            <nav className="flex flex-col gap-4 text-sm">
              <a href="#services" className="hover:text-indigo-600" onClick={() => setIsMenuOpen(false)}>{t.nav.services}</a>
              <a href="#solution" className="hover:text-indigo-600" onClick={() => setIsMenuOpen(false)}>{t.nav.solution}</a>
              <a href="#cases" className="hover:text-indigo-600" onClick={() => setIsMenuOpen(false)}>{t.nav.cases}</a>
              <a href="#team" className="hover:text-indigo-600" onClick={() => setIsMenuOpen(false)}>{t.nav.team}</a>
              <a href="/calculator/" className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors text-center" onClick={() => setIsMenuOpen(false)}>{t.nav.calculate}</a>
              <div className="flex justify-center gap-4 pt-2 border-t">
                 <a href="/en/" className={`font-medium ${lang === 'en' ? 'text-indigo-600' : 'text-gray-500'}`}>EN</a>
                 <a href="/" className={`font-medium ${lang === 'ru' ? 'text-indigo-600' : 'text-gray-500'}`}>RU</a>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
              {t.hero.title_prefix} <span className="text-indigo-600">{t.hero.title_highlight}</span> {t.hero.title_suffix}
            </h1>
            <p className="mt-4 text-gray-700 text-lg">
              {t.hero.desc} 
              <strong> {t.hero.desc_bold}</strong>
            </p>
            <p className="mt-2 text-gray-600">
              {t.hero.sub_desc}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/calculator/" className="bg-indigo-600 text-white py-3 px-6 rounded-md font-medium shadow hover:bg-indigo-700 transition-colors">
                {t.hero.btn_calc}
              </a>
              <a href="#solution" className="py-3 px-6 rounded-md border hover:bg-gray-50 transition-colors">
                {t.hero.btn_how}
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 text-sm">
              {t.hero.badges.map((badge, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">✓</div>
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-indigo-50 rounded-lg p-6 shadow-lg border border-indigo-100">
            <div className="bg-white rounded-md p-6">
              <h3 className="text-lg font-semibold">{t.form.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{t.form.subtitle}</p>

              <form className="mt-4 space-y-3" onSubmit={handleEstimateSubmit}>
                <input 
                  required 
                  placeholder={t.form.name_placeholder}
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                  value={estimateForm.name}
                  onChange={(e) => setEstimateForm({...estimateForm, name: e.target.value})}
                />
                <input 
                  required 
                  placeholder={t.form.contact_placeholder}
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                  value={estimateForm.contact}
                  onChange={(e) => setEstimateForm({...estimateForm, contact: e.target.value})}
                />
                <select 
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                  value={estimateForm.typeIndex}
                  onChange={(e) => setEstimateForm({...estimateForm, typeIndex: Number(e.target.value)})}
                >
                  {t.form.types.map((type, i) => <option key={i} value={i}>{type}</option>)}
                </select>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-600">{t.form.file_label}</label>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 px-4 rounded border transition-colors">
                      {t.form.file_btn}
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          setFileName(file ? file.name : null);
                          setEstimateForm({...estimateForm, file: file});
                        }}
                      />
                    </label>
                    <span className="text-xs text-gray-500 truncate max-w-[150px]">{fileName || t.form.file_none}</span>
                  </div>
                </div>
                <button 
                  className={`w-full text-white py-3 rounded font-medium transition-colors ${estimateSent ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'} ${isSending ? 'opacity-75 cursor-not-allowed' : ''}`}
                  disabled={estimateSent || isSending}
                >
                  {isSending ? (lang === 'en' ? 'Sending...' : 'Отправка...') : (estimateSent ? t.form.submit_btn_success : t.form.submit_btn)}
                </button>
              </form>
            </div>

            <div className="mt-4 text-sm text-gray-600 text-center">
              <span className="font-semibold text-indigo-600">{t.form.guarantee_label}</span> {t.form.guarantee_text}
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section id="problem" className="mt-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center">{t.problem.title}</h2>
          <p className="text-gray-600 mt-3 text-center max-w-2xl mx-auto">{t.problem.subtitle}</p>

          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {t.problem.cards.map((card, i) => (
              <article key={i} className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-lg">{card.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{card.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="mt-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center">{t.services_title}</h2>
          <p className="text-gray-600 mt-3 text-center max-w-2xl mx-auto">{t.services_subtitle}</p>

          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>
        </section>

        {/* Solution Section */}
        <section id="solution" className="mt-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center">{t.solution.title}</h2>
          <p className="text-gray-600 mt-3 text-center max-w-2xl mx-auto">{t.solution.subtitle}</p>

          <div className="mt-10 grid md:grid-cols-4 gap-6">
            {t.solution.steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-indigo-600">{i + 1}</div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cases Section */}
        <section id="cases" className="mt-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center">{t.cases.title}</h2>
          <p className="text-gray-600 mt-3 text-center max-w-2xl mx-auto">{t.cases.subtitle}</p>

          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {/* Case 1 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img src="/img/cases/residential-complex.jpg" alt="Case 1" className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="font-semibold text-lg">{t.cases.items[0].title}</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t.cases.items[0].before_label}</span>
                    <span>{t.cases.items[0].before_val}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t.cases.items[0].after_label}</span>
                    <span>{t.cases.items[0].after_val}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-green-600">
                    <span>{t.cases.items[0].save_label}</span>
                    <span>{t.cases.items[0].save_val}</span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-400">{t.cases.items[0].time}</div>
              </div>
            </div>

            {/* Case 2 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img src="/img/cases/industrial-object.jpg" alt="Case 2" className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="font-semibold text-lg">{t.cases.items[1].title}</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t.cases.items[1].before_label}</span>
                    <span>{t.cases.items[1].before_val}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t.cases.items[1].after_label}</span>
                    <span>{t.cases.items[1].after_val}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-green-600">
                    <span>{t.cases.items[1].save_label}</span>
                    <span>{t.cases.items[1].save_val}</span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-400">{t.cases.items[1].time}</div>
              </div>
            </div>

            {/* Case 3 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img src="/img/cases/reconstruction-fok-before-after.jpg" alt="Case 3" className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="font-semibold text-lg">{t.cases.items[2].title}</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t.cases.items[2].before_label}</span>
                    <span>{t.cases.items[2].before_val}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t.cases.items[2].after_label}</span>
                    <span>{t.cases.items[2].after_val}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-green-600">
                    <span>{t.cases.items[2].save_label}</span>
                    <span>{t.cases.items[2].save_val}</span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-400">{t.cases.items[2].time}</div>
              </div>
            </div>

            {/* Case 4 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img src="/img/cases/cottage_178m2.jpg" alt="Case 4" className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="font-semibold text-lg">{t.cases.items[3].title}</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <p className="text-gray-600 mb-2">{t.cases.items[3].desc}</p>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t.cases.items[3].before_label}</span>
                    <span>{t.cases.items[3].before_val}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t.cases.items[3].after_label}</span>
                    <span>{t.cases.items[3].after_val}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-green-600">
                    <span>{t.cases.items[3].save_label}</span>
                    <span>{t.cases.items[3].save_val}</span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-400">{t.cases.items[3].time}</div>
              </div>
            </div>

            {/* Case 5 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img src="/img/cases/house_inspection.jpg" alt="Case 5" className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="font-semibold text-lg">{t.cases.items[4].title}</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <p className="text-gray-600">{t.cases.items[4].desc}</p>
                </div>
              </div>
            </div>

            {/* Case 6 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img src="/img/cases/defect_elimination.jpg" alt="Case 6" className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="font-semibold text-lg">{t.cases.items[5].title}</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <p className="text-gray-600">{t.cases.items[5].desc}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section id="team" className="mt-20">
          <div className="bg-gradient-to-r from-indigo-50 to-white rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">{t.team.title}</h2>
                <blockquote className="mt-6 text-lg text-gray-700 italic border-l-4 border-indigo-400 pl-4">
                  {t.team.quote}
                </blockquote>
                <div className="mt-6">
                  <div className="font-semibold">{t.team.name}</div>
                  <div className="text-sm text-gray-500">{t.team.role}</div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  {t.team.badges.map((badge, i) => (
                    <span key={i} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">{badge}</span>
                  ))}
                </div>
              </div>
              <div className="flex justify-center">
                <img src="/img/anton.png" alt="Anton Kruchina" className="w-64 h-64 rounded-full object-cover shadow-lg" />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center">{t.faq.title}</h2>
          <div className="mt-8 max-w-2xl mx-auto space-y-4">
            {t.faq.items.map((item, i) => (
              <details key={i} className="bg-white p-5 rounded-lg shadow-sm group">
                <summary className="font-medium cursor-pointer list-none flex justify-between items-center">
                  {item.q}
                  <span className="text-indigo-600 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-3 text-gray-600">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Contact / CTA Section */}
        <section id="contact" className="mt-20 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-8 md:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">{t.contact.title}</h2>
              <p className="mt-4 text-indigo-100">
                {t.contact.subtitle}
              </p>

              <div className="mt-6 space-y-3 text-indigo-100">
                <div className="flex items-center gap-3">
                  <span>📧</span>
                  <span>auditprojekt@yandex.by</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>📞</span>
                  <span>+375291405990</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>💬</span>
                  <span>Viber, Telegram, WhatsApp по номеру +375291405990</span>
                </div>
              </div>
            </div>

            <form className="bg-white rounded-lg p-6 text-gray-900" onSubmit={handleContactSubmit}>
              <input 
                required 
                placeholder={t.contact.name_placeholder}
                className="w-full border rounded px-3 py-2 mb-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                value={contactForm.name}
                onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
              />
              <input 
                required 
                placeholder={t.contact.phone_placeholder}
                className="w-full border rounded px-3 py-2 mb-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                value={contactForm.phone}
                onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
              />
              <textarea 
                placeholder={t.contact.details_placeholder}
                className="w-full border rounded px-3 py-2 mb-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none" 
                rows={3}
                value={contactForm.details}
                onChange={(e) => setContactForm({...contactForm, details: e.target.value})}
              ></textarea>
              <div className="flex gap-2">
                <button 
                  className={`flex-1 text-white py-3 rounded font-medium transition-colors ${contactSent ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'} ${isSending ? 'opacity-75 cursor-not-allowed' : ''}`}
                  disabled={contactSent || isSending}
                >
                  {isSending ? (lang === 'en' ? 'Sending...' : 'Отправка...') : (contactSent ? t.contact.btn_success : t.contact.btn)}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 py-8 border-t text-sm text-gray-500">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="font-semibold text-gray-900">Audit & Project</div>
              <div className="mt-2">{t.footer.desc}</div>
              <div className="mt-2">{t.footer.work_since}</div>
              <div className="mt-1">{t.footer.unp}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">{t.footer.standards_title}</div>
              <div className="mt-2">{t.footer.standards_list}</div>
              <div className="mt-4 font-semibold text-gray-900">{t.footer.office_title}</div>
              <div className="mt-1">{t.footer.office_addr}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">{t.footer.contact_title}</div>
              <div className="mt-2">+375291405990</div>
              <div>auditprojekt@yandex.by</div>
              <div className="mt-1 text-xs">Viber, Telegram, WhatsApp</div>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-400">
            {t.footer.rights}
          </div>
        </footer>

      </main>

      {/* Floating Calculator Button */}
      <a 
        href="/calculator/" 
        className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-110 flex items-center justify-center z-50 group"
        title={lang === 'ru' ? 'Калькулятор стоимости' : 'Cost Calculator'}
      >
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap mr-0 group-hover:mr-2 text-sm font-medium">
          {lang === 'ru' ? 'Калькулятор' : 'Calculator'}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </a>
    </div>
  );
}

ReactDOM.render(<AuditLanding />, document.getElementById('root'));
