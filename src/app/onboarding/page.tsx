"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, X, Search, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface RegistrationData {
  role: "ALUMNI" | "STUDENT" | null;
  firstName: string;
  lastName: string;
  bio: string;

  // Shared
  major: string;
  gradYear: string;
  gpa: string;

  // Alumni Specific
  university: string;
  country: string;
  financialAid: string;

  // Student Specific
  targetUniversities: string[];

  // Tests
  languageTest: string;
  languageScore: string;
  standardizedTest: string;
  standardizedScore: string;

  activities: string[];
  openToMentoring: boolean;
  linkedin: string;
  telegram: string;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

export default function OnboardingWizard() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [activityInput, setActivityInput] = useState("");
  
  // University Search State
  const [uniSearch, setUniSearch] = useState("");
  const [isUniDropdownOpen, setIsUniDropdownOpen] = useState(false);
  const [uniResults, setUniResults] = useState<string[]>([]);
  const [isLoadingUnis, setIsLoadingUnis] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<RegistrationData>({
    role: null,
    firstName: "",
    lastName: "",
    bio: "",
    university: "",
    country: "",
    major: "",
    gradYear: "",
    gpa: "",
    financialAid: "",
    targetUniversities: [],
    languageTest: "",
    languageScore: "",
    standardizedTest: "",
    standardizedScore: "",
    activities: [],
    openToMentoring: false,
    linkedin: "",
    telegram: "",
  });

  // Debounced API Search for Universities
  useEffect(() => {
    if (uniSearch.trim().length < 2) {
      setUniResults([]);
      return;
    }
    const handler = setTimeout(async () => {
      setIsLoadingUnis(true);
      try {
        const res = await fetch(`http://universities.hipolabs.com/search?name=${encodeURIComponent(uniSearch)}`);
        const json = await res.json();
        // Extract unique names
        const uniqueNames = Array.from(new Set(json.map((u: any) => u.name))) as string[];
        setUniResults(uniqueNames.slice(0, 40));
      } catch (err) {
        console.error("Failed fetching universities:", err);
      } finally {
        setIsLoadingUnis(false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [uniSearch]);

  // Handle clicking outside Dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUniDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalSteps = 5;

  const nextStep = () => {
    if (step < totalSteps) {
      setDirection(1);
      setStep((prev) => prev + 1);
    } else {
      console.log("Saving full profile to Prisma...", data);
      router.push("/feed");
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setDirection(-1);
      setStep((prev) => prev - 1);
    }
  };

  const updateData = (field: keyof RegistrationData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  // The Comma Fix interceptor
  const handleDecimalInput = (field: keyof RegistrationData, e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/,/g, '.'); // Swap commas mapping to standard dot formatting
    updateData(field, val);
  };

  // Activities logic
  const addActivity = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && activityInput.trim() !== '') {
      e.preventDefault();
      if (!data.activities.includes(activityInput.trim())) {
        updateData('activities', [...data.activities, activityInput.trim()]);
      }
      setActivityInput("");
    }
  };
  const removeActivity = (activity: string) => updateData('activities', data.activities.filter(a => a !== activity));

  // Multi-select for student targets
  const addTargetUni = (uni: string) => {
    if (!data.targetUniversities.includes(uni)) {
      updateData('targetUniversities', [...data.targetUniversities, uni]);
    }
    setUniSearch("");
    setIsUniDropdownOpen(false);
  };
  const removeTargetUni = (uni: string) => {
    updateData('targetUniversities', data.targetUniversities.filter(u => u !== uni));
  };


  return (
    <div className="min-h-screen bg-[#0a110e] text-white flex flex-col font-sans overflow-hidden">
      
      {/* Progress Bar */}
      <div className="w-full h-1 bg-white/10 fixed top-0 left-0 z-50">
        <motion.div 
          className="h-full bg-shoqan-primary"
          initial={{ width: `${((step - 1) / totalSteps) * 100}%` }}
          animate={{ width: `${(step / totalSteps) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 md:px-24 max-w-5xl mx-auto w-full py-20 relative">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "anticipate" }}
            className="w-full"
          >
            {/* STEP 1: Role */}
            {step === 1 && (
              <div className="space-y-12">
                <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-white">Who are you?</h1>
                <p className="text-xl text-white/50 font-light">Customizing your Shoqan Alumni experience.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                  <button
                    onClick={() => updateData('role', 'STUDENT')}
                    className={cn(
                      "flex flex-col items-start p-8 rounded-3xl border-2 transition-all duration-300 text-left",
                      data.role === 'STUDENT' ? "border-shoqan-primary bg-shoqan-primary/10" : "border-white/10 hover:border-white/30 bg-white/5"
                    )}
                  >
                    <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mb-6 text-2xl">🎓</div>
                    <h3 className="text-2xl font-medium mb-2">I am a Student</h3>
                    <p className="text-white/50">Looking for mentorship and university guidance.</p>
                  </button>
                  <button
                    onClick={() => updateData('role', 'ALUMNI')}
                    className={cn(
                      "flex flex-col items-start p-8 rounded-3xl border-2 transition-all duration-300 text-left",
                      data.role === 'ALUMNI' ? "border-shoqan-primary bg-shoqan-primary/10" : "border-white/10 hover:border-white/30 bg-white/5"
                    )}
                  >
                    <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mb-6 text-2xl">💼</div>
                    <h3 className="text-2xl font-medium mb-2">I am an Alumnus</h3>
                    <p className="text-white/50">Connecting with graduates and mentoring students.</p>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Personal Details */}
            {step === 2 && (
              <div className="space-y-12 max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Let's start with the basics.</h1>
                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={data.firstName}
                      onChange={(e) => updateData('firstName', e.target.value)}
                      className="w-full bg-transparent border-b border-white/20 text-3xl pb-3 focus:outline-none focus:border-shoqan-primary transition-colors placeholder:text-white/20 font-light"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={data.lastName}
                      onChange={(e) => updateData('lastName', e.target.value)}
                      className="w-full bg-transparent border-b border-white/20 text-3xl pb-3 focus:outline-none focus:border-shoqan-primary transition-colors placeholder:text-white/20 font-light"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Short bio (e.g. Software Engineer, Stanford '24)"
                    value={data.bio}
                    onChange={(e) => updateData('bio', e.target.value)}
                    className="w-full bg-transparent border-b border-white/20 text-2xl pb-3 focus:outline-none focus:border-shoqan-primary transition-colors placeholder:text-white/20 font-light mt-8"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Academic & Tests */}
            {step === 3 && (
              <motion.div layout className="space-y-12 max-w-4xl">
                <motion.h1 layout className="text-4xl md:text-5xl font-semibold tracking-tight">
                  {data.role === 'ALUMNI' ? "Where did you go?" : "What are your goals?"}
                </motion.h1>
                
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 items-start gap-10">
                  
                  {/* Dynamic University Autocomplete Wrapper */}
                  <div className="relative md:col-span-2" ref={dropdownRef}>
                    <label className="text-sm font-medium text-white/50 mb-2 block uppercase tracking-wider">
                      {data.role === 'ALUMNI' ? "Attended University" : "Target Universities"}
                    </label>
                    
                    {/* Student Selected Pillars */}
                    {data.role === 'STUDENT' && data.targetUniversities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        <AnimatePresence>
                          {data.targetUniversities.map((uni) => (
                            <motion.div key={uni} initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="flex items-center gap-2 px-3 py-1.5 bg-shoqan-primary/10 border border-shoqan-primary/30 rounded-full text-shoqan-light text-sm">
                              {uni}
                              <button onClick={() => removeTargetUni(uni)} className="hover:text-red-400"><X className="h-3 w-3" /></button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                    
                    <div className="relative">
                      <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 text-white/30" />
                      <input
                        type="text"
                        placeholder="Search global universities via Hipolabs API..."
                        value={data.role === 'ALUMNI' && !isUniDropdownOpen && data.university ? data.university : uniSearch}
                        onChange={(e) => {
                          setUniSearch(e.target.value);
                          if (data.role === 'ALUMNI') updateData('university', e.target.value);
                          setIsUniDropdownOpen(true);
                        }}
                        onFocus={() => setIsUniDropdownOpen(true)}
                        className="w-full bg-transparent border-b border-white/20 text-2xl pb-3 pl-10 pr-10 focus:outline-none focus:border-shoqan-primary transition-colors placeholder:text-white/20 font-light"
                      />
                      {isLoadingUnis && <Loader2 className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 animate-spin" />}
                    </div>

                    <AnimatePresence>
                      {isUniDropdownOpen && uniResults.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 w-full mt-2 bg-[#121c16] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto"
                        >
                          {uniResults.map((uni, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                if (data.role === 'STUDENT') addTargetUni(uni);
                                else {
                                  updateData('university', uni);
                                  setUniSearch("");
                                  setIsUniDropdownOpen(false);
                                }
                              }}
                              className="w-full text-left px-5 py-3 hover:bg-white/5 transition-colors text-white/80 border-b border-white/5 last:border-0"
                            >
                              {uni}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative">
                     <label className="text-sm font-medium text-white/50 mb-2 block uppercase tracking-wider">
                      {data.role === 'ALUMNI' ? "Major" : "Intended Major"}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Computer Science"
                      value={data.major}
                      onChange={(e) => updateData('major', e.target.value)}
                      className="w-full bg-transparent border-b border-white/20 text-2xl pb-3 focus:outline-none focus:border-shoqan-primary transition-colors placeholder:text-white/20 font-light"
                    />
                  </div>

                  <div className="relative">
                     <label className="text-sm font-medium text-white/50 mb-2 block uppercase tracking-wider">
                      {data.role === 'ALUMNI' ? "Graduation Year" : "Expected Graduation"}
                    </label>
                    <input
                      type="number"
                      step="1"
                      placeholder="e.g. 2024"
                      value={data.gradYear}
                      onChange={(e) => updateData('gradYear', e.target.value)}
                      className="w-full bg-transparent border-b border-white/20 text-2xl pb-3 focus:outline-none focus:border-shoqan-primary transition-colors placeholder:text-white/20 font-light"
                    />
                  </div>

                  {data.role === 'ALUMNI' && (
                    <div className="relative">
                      <label className="text-sm font-medium text-white/50 mb-2 block uppercase tracking-wider">Financial Aid Status</label>
                      <div className="relative">
                        <select
                          value={data.financialAid}
                          onChange={(e) => updateData('financialAid', e.target.value)}
                          className="appearance-none w-full bg-transparent border-b border-white/20 text-2xl pb-3 focus:outline-none focus:border-shoqan-primary transition-colors font-light cursor-pointer text-white"
                        >
                          <option className="bg-[#0a110e]" value="">Select Aid...</option>
                          <option className="bg-[#0a110e]" value="Full Ride">Full Ride</option>
                          <option className="bg-[#0a110e]" value="Partial">Partial</option>
                          <option className="bg-[#0a110e]" value="None">None</option>
                        </select>
                        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 pointer-events-none pb-2" />
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <label className="text-sm font-medium text-white/50 mb-2 block uppercase tracking-wider">GPA</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 3.8"
                      value={data.gpa}
                      onChange={(e) => handleDecimalInput('gpa', e)}
                      className="w-full bg-transparent border-b border-white/20 text-2xl pb-3 focus:outline-none focus:border-shoqan-primary transition-colors placeholder:text-white/20 font-light"
                    />
                  </div>

                  {/* Dynamic Test Constructors */}
                  <motion.div layout className="relative col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10 pt-4 border-t border-white/10 mt-2">
                    
                    <div className="relative">
                      <label className="text-sm font-medium text-white/50 mb-2 block uppercase tracking-wider">Language Proficiency</label>
                      <div className="relative">
                        <select
                          value={data.languageTest}
                          onChange={(e) => updateData('languageTest', e.target.value)}
                          className="appearance-none w-full bg-transparent border-b border-white/20 text-2xl pb-3 focus:outline-none focus:border-shoqan-primary transition-colors font-light cursor-pointer text-white"
                        >
                          <option className="bg-[#0a110e]" value="">None / Not Taken</option>
                          <option className="bg-[#0a110e]" value="IELTS">IELTS</option>
                          <option className="bg-[#0a110e]" value="TOEFL">TOEFL</option>
                          <option className="bg-[#0a110e]" value="Duolingo">Duolingo</option>
                          <option className="bg-[#0a110e]" value="HSK">HSK</option>
                          <option className="bg-[#0a110e]" value="Waived">Waived</option>
                        </select>
                        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 pointer-events-none pb-2" />
                      </div>
                      
                      <AnimatePresence>
                        {data.languageTest && !["Waived", "None", ""].includes(data.languageTest) && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-6">
                            <label className="text-sm font-medium text-shoqan-primary/80 mb-2 block uppercase tracking-wider">{data.languageTest} Score</label>
                            <input
                              type="number"
                              step="0.1"
                              placeholder="Score"
                              value={data.languageScore}
                              onChange={(e) => handleDecimalInput('languageScore', e)}
                              className="w-full bg-transparent border-b border-shoqan-primary/50 text-2xl pb-3 focus:outline-none focus:border-shoqan-primary transition-colors placeholder:text-white/20 font-light text-shoqan-primary"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="relative">
                      <label className="text-sm font-medium text-white/50 mb-2 block uppercase tracking-wider">Standardized Test</label>
                      <div className="relative">
                        <select
                          value={data.standardizedTest}
                          onChange={(e) => updateData('standardizedTest', e.target.value)}
                          className="appearance-none w-full bg-transparent border-b border-white/20 text-2xl pb-3 focus:outline-none focus:border-shoqan-primary transition-colors font-light cursor-pointer text-white"
                        >
                          <option className="bg-[#0a110e]" value="">None / Not Taken</option>
                          <option className="bg-[#0a110e]" value="SAT">SAT</option>
                          <option className="bg-[#0a110e]" value="ACT">ACT</option>
                          <option className="bg-[#0a110e]" value="UNT">UNT</option>
                        </select>
                        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 pointer-events-none pb-2" />
                      </div>

                      <AnimatePresence>
                        {data.standardizedTest && !["None", ""].includes(data.standardizedTest) && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-6">
                            <label className="text-sm font-medium text-shoqan-primary/80 mb-2 block uppercase tracking-wider">{data.standardizedTest} Score</label>
                            <input
                              type="number"
                              step="1"
                              placeholder="Score"
                              value={data.standardizedScore}
                              onChange={(e) => handleDecimalInput('standardizedScore', e)}
                              className="w-full bg-transparent border-b border-shoqan-primary/50 text-2xl pb-3 focus:outline-none focus:border-shoqan-primary transition-colors placeholder:text-white/20 font-light text-shoqan-primary"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  </motion.div>

                </motion.div>
              </motion.div>
            )}

            {/* STEP 4: Extracurriculars */}
            {step === 4 && (
              <div className="space-y-12 max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">What defines you outside classes?</h1>
                <p className="text-xl text-white/50 font-light pt-2">Type an activity and press <kbd className="px-2 py-1 bg-white/10 rounded-md font-mono text-sm">Enter</kbd></p>
                
                <div>
                  <input
                    type="text"
                    placeholder="e.g. MUN, Robotics Club, Volunteer..."
                    value={activityInput}
                    onChange={(e) => setActivityInput(e.target.value)}
                    onKeyDown={addActivity}
                    className="w-full bg-transparent border-b border-white/20 text-3xl pb-4 focus:outline-none focus:border-shoqan-primary transition-colors placeholder:text-white/20 font-light"
                  />
                  
                  <div className="flex flex-wrap gap-3 mt-8">
                    <AnimatePresence>
                      {data.activities.map((activity) => (
                        <motion.div
                          key={activity}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="flex items-center gap-2 px-5 py-3 bg-white/10 rounded-full border border-white/10 hover:border-white/30 transition-colors"
                        >
                          <span className="text-lg">{activity}</span>
                          <button onClick={() => removeActivity(activity)} className="hover:text-red-400 transition-colors ml-1">
                            <X className="h-5 w-5" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Networking */}
            {step === 5 && (
              <div className="space-y-12 max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
                  {data.role === 'ALUMNI' ? "Expand your network." : "Stay Connected."}
                </h1>
                
                <div className="space-y-10">
                  {data.role === 'ALUMNI' && (
                    <button
                      onClick={() => updateData('openToMentoring', !data.openToMentoring)}
                      className="w-full flex items-center justify-between p-8 rounded-3xl border border-white/10 hover:border-white/30 bg-white/5 transition-all duration-300"
                    >
                      <div className="text-left">
                         <h3 className="text-2xl font-medium mb-2">Open to Mentoring</h3>
                         <p className="text-white/50 font-light">Allow students to reach out for guidance.</p>
                      </div>
                      <div className={cn(
                        "h-8 w-14 rounded-full p-1 transition-colors duration-300 flex",
                        data.openToMentoring ? "bg-shoqan-primary" : "bg-white/10"
                      )}>
                         <motion.div layout className="h-6 w-6 rounded-full bg-white shadow-sm" style={{ marginLeft: data.openToMentoring ? 'auto' : '0' }} />
                      </div>
                    </button>
                  )}

                  <div className="space-y-8">
                    <div className="relative">
                      <label className="text-sm font-medium text-white/50 mb-2 block uppercase tracking-wider">LinkedIn Profile URL</label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        value={data.linkedin}
                        onChange={(e) => updateData('linkedin', e.target.value)}
                        className="w-full bg-transparent border-b border-white/20 text-2xl pb-3 focus:outline-none focus:border-shoqan-primary transition-colors placeholder:text-white/20 font-light"
                      />
                    </div>
                    
                    <div className="relative">
                      <label className="text-sm font-medium text-white/50 mb-2 block uppercase tracking-wider">Telegram Username</label>
                      <input
                        type="text"
                        placeholder="@username"
                        value={data.telegram}
                        onChange={(e) => updateData('telegram', e.target.value)}
                        className="w-full bg-transparent border-b border-white/20 text-2xl pb-3 focus:outline-none focus:border-shoqan-primary transition-colors placeholder:text-white/20 font-light"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="w-full p-6 sm:px-12 md:px-24 flex items-center justify-between z-10 border-t border-white/5 bg-[#0a110e]/80 backdrop-blur-md">
        <button
          onClick={prevStep}
          className={cn(
            "flex items-center gap-2 px-6 py-4 rounded-full text-lg font-medium transition-all cursor-pointer",
            step === 1 ? "opacity-0 pointer-events-none" : "text-white/50 hover:text-white hover:bg-white/5"
          )}
        >
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        
        <button
          onClick={nextStep}
          disabled={step === 1 && !data.role}
          className="flex items-center gap-2 px-10 py-4 cursor-pointer bg-shoqan-primary text-[#0a110e] hover:bg-emerald-400 rounded-full text-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {step === totalSteps ? "Complete Profile" : "Continue"}
          {step === totalSteps ? <Check className="w-5 h-5 ml-2" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
