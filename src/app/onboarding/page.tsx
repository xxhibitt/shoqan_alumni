"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface RegistrationData {
  role: "ALUMNI" | "STUDENT" | null;
  firstName: string;
  lastName: string;
  bio: string;
  university: string;
  country: string;
  major: string;
  gradYear: string;
  gpa: string;
  sat: string;
  ielts: string;
  financialAid: string;
  activities: string[];
  openToMentoring: boolean;
  linkedin: string;
  telegram: string;
}

const TOP_UNIVERSITIES = [
  "Harvard University", "Stanford University", "MIT", "Cambridge University", "Oxford University",
  "Nazarbayev University", "KBTU", "SDU", "UCL", "Yale University", "Princeton University", "Columbia University"
];

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
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [activityInput, setActivityInput] = useState("");
  const [uniSearch, setUniSearch] = useState("");
  const [isUniDropdownOpen, setIsUniDropdownOpen] = useState(false);
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
    sat: "",
    ielts: "",
    financialAid: "",
    activities: [],
    openToMentoring: false,
    linkedin: "",
    telegram: "",
  });

  // Close dropdown when clicking outside
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
      console.log("Saving profile:", data);
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

  const addActivity = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && activityInput.trim() !== '') {
      e.preventDefault();
      if (!data.activities.includes(activityInput.trim())) {
        updateData('activities', [...data.activities, activityInput.trim()]);
      }
      setActivityInput("");
    }
  };

  const removeActivity = (activity: string) => {
    updateData('activities', data.activities.filter(a => a !== activity));
  };

  const filteredUnis = TOP_UNIVERSITIES.filter(u => 
    u.toLowerCase().includes(uniSearch.toLowerCase())
  );

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
            {/* STEP 1: Role Selection */}
            {step === 1 && (
              <div className="space-y-12">
                <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-white">Who are you?</h1>
                <p className="text-xl text-white/50 font-light">Customizing your Shoqan Alumni experience.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                  <button
                    onClick={() => updateData('role', 'STUDENT')}
                    className={cn(
                      "flex flex-col items-start p-8 rounded-3xl border-2 transition-all duration-300 text-left",
                      data.role === 'STUDENT'
                        ? "border-shoqan-primary bg-shoqan-primary/10"
                        : "border-white/10 hover:border-white/30 bg-white/5"
                    )}
                  >
                    <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
                      <span className="text-2xl">🎓</span>
                    </div>
                    <h3 className="text-2xl font-medium mb-2">I am a Student</h3>
                    <p className="text-white/50">Looking for mentorship and university guidance.</p>
                  </button>
                  
                  <button
                    onClick={() => updateData('role', 'ALUMNI')}
                    className={cn(
                      "flex flex-col items-start p-8 rounded-3xl border-2 transition-all duration-300 text-left",
                      data.role === 'ALUMNI'
                        ? "border-shoqan-primary bg-shoqan-primary/10"
                        : "border-white/10 hover:border-white/30 bg-white/5"
                    )}
                  >
                    <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
                      <span className="text-2xl">💼</span>
                    </div>
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
                      className="w-full bg-transparent border-b-2 border-white/20 text-3xl pb-3 focus:outline-none focus:border-shoqan-primary transition-colors placeholder:text-white/20 font-light"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={data.lastName}
                      onChange={(e) => updateData('lastName', e.target.value)}
                      className="w-full bg-transparent border-b-2 border-white/20 text-3xl pb-3 focus:outline-none focus:border-shoqan-primary transition-colors placeholder:text-white/20 font-light"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Short bio (e.g. Software Engineer at Google)"
                      value={data.bio}
                      onChange={(e) => updateData('bio', e.target.value)}
                      className="w-full bg-transparent border-b-2 border-white/20 text-2xl pb-3 focus:outline-none focus:border-shoqan-primary transition-colors placeholder:text-white/20 font-light mt-8"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Academic/Professional Data */}
            {step === 3 && (
              <div className="space-y-12 max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
                  {data.role === 'ALUMNI' ? "Where did you go?" : "What are your goals?"}
                </h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* University Search UI */}
                  <div className="relative" ref={dropdownRef}>
                    <label className="text-sm font-medium text-white/50 mb-2 block uppercase tracking-wider">
                      {data.role === 'ALUMNI' ? "University" : "Target University"}
                    </label>
                    <div className="relative">
                      <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 text-white/30" />
                      <input
                        type="text"
                        placeholder="Search universities..."
                        value={uniSearch || data.university}
                        onChange={(e) => {
                          setUniSearch(e.target.value);
                          updateData('university', e.target.value);
                          setIsUniDropdownOpen(true);
                        }}
                        onFocus={() => setIsUniDropdownOpen(true)}
                        className="w-full bg-transparent border-b-2 border-white/20 text-2xl pb-3 pl-10 focus:outline-none focus:border-shoqan-primary transition-colors placeholder:text-white/20 font-light"
                      />
                    </div>
                    {isUniDropdownOpen && filteredUnis.length > 0 && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-[#121c16] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
                        {filteredUnis.map(uni => (
                          <button
                            key={uni}
                            onClick={() => {
                              updateData('university', uni);
                              setUniSearch("");
                              setIsUniDropdownOpen(false);
                            }}
                            className="w-full text-left px-6 py-4 hover:bg-white/5 transition-colors text-lg text-white/80"
                          >
                            {uni}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                     <label className="text-sm font-medium text-white/50 mb-2 block uppercase tracking-wider">
                      {data.role === 'ALUMNI' ? "Graduation Year" : "Expected Graduation"}
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 2024"
                      value={data.gradYear}
                      onChange={(e) => updateData('gradYear', e.target.value)}
                      className="w-full bg-transparent border-b-2 border-white/20 text-2xl pb-3 focus:outline-none focus:border-shoqan-primary transition-colors placeholder:text-white/20 font-light"
                    />
                  </div>

                  {data.role === 'ALUMNI' && (
                    <div className="relative">
                      <label className="text-sm font-medium text-white/50 mb-2 block uppercase tracking-wider">Major</label>
                      <input
                        type="text"
                        placeholder="e.g. Computer Science"
                        value={data.major}
                        onChange={(e) => updateData('major', e.target.value)}
                        className="w-full bg-transparent border-b-2 border-white/20 text-2xl pb-3 focus:outline-none focus:border-shoqan-primary transition-colors placeholder:text-white/20 font-light"
                      />
                    </div>
                  )}

                  <div className="relative">
                    <label className="text-sm font-medium text-white/50 mb-2 block uppercase tracking-wider">GPA (Optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 3.8"
                      value={data.gpa}
                      onChange={(e) => updateData('gpa', e.target.value)}
                      className="w-full bg-transparent border-b-2 border-white/20 text-2xl pb-3 focus:outline-none focus:border-shoqan-primary transition-colors placeholder:text-white/20 font-light"
                    />
                  </div>

                  <div className="relative flex gap-4 w-full md:col-span-2">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-white/50 mb-2 block uppercase tracking-wider">SAT</label>
                      <input
                        type="number"
                        placeholder="1500"
                        value={data.sat}
                        onChange={(e) => updateData('sat', e.target.value)}
                        className="w-full bg-transparent border-b-2 border-white/20 text-2xl pb-3 focus:outline-none focus:border-shoqan-primary transition-colors placeholder:text-white/20 font-light"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium text-white/50 mb-2 block uppercase tracking-wider">IELTS</label>
                      <input
                        type="number"
                        step="0.5"
                        placeholder="7.5"
                        value={data.ielts}
                        onChange={(e) => updateData('ielts', e.target.value)}
                        className="w-full bg-transparent border-b-2 border-white/20 text-2xl pb-3 focus:outline-none focus:border-shoqan-primary transition-colors placeholder:text-white/20 font-light"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Extracurriculars */}
            {step === 4 && (
              <div className="space-y-12 max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">What defines you outside academics?</h1>
                <p className="text-xl text-white/50 font-light pt-2">Type an activity and press <kbd className="px-2 py-1 bg-white/10 rounded-md font-mono text-sm">Enter</kbd></p>
                
                <div>
                  <input
                    type="text"
                    placeholder="e.g. MUN, Robotics Club, Volunteer..."
                    value={activityInput}
                    onChange={(e) => setActivityInput(e.target.value)}
                    onKeyDown={addActivity}
                    className="w-full bg-transparent border-b-2 border-white/20 text-3xl pb-4 focus:outline-none focus:border-shoqan-primary transition-colors placeholder:text-white/20 font-light"
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
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Expand your network.</h1>
                
                <div className="space-y-10">
                  <button
                    onClick={() => updateData('openToMentoring', !data.openToMentoring)}
                    className="w-full flex items-center justify-between p-8 rounded-3xl border-2 border-white/10 hover:border-white/30 bg-white/5 transition-all duration-300"
                  >
                    <div className="text-left">
                       <h3 className="text-2xl font-medium mb-2">Open to Mentoring</h3>
                       <p className="text-white/50 font-light">Allow students to reach out for guidance.</p>
                    </div>
                    <div className={cn(
                      "h-8 w-14 rounded-full p-1 transition-colors duration-300",
                      data.openToMentoring ? "bg-shoqan-primary" : "bg-white/10"
                    )}>
                       <motion.div layout className="h-6 w-6 rounded-full bg-white shadow-sm" style={{ alignSelf: data.openToMentoring ? 'flex-end' : 'flex-start', marginLeft: data.openToMentoring ? 'auto' : '0' }} />
                    </div>
                  </button>

                  <div className="space-y-8">
                    <div className="relative">
                      <label className="text-sm font-medium text-white/50 mb-2 block uppercase tracking-wider">LinkedIn Profile URL</label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        value={data.linkedin}
                        onChange={(e) => updateData('linkedin', e.target.value)}
                        className="w-full bg-transparent border-b-2 border-white/20 text-2xl pb-3 focus:outline-none focus:border-shoqan-primary transition-colors placeholder:text-white/20 font-light"
                      />
                    </div>
                    
                    <div className="relative">
                      <label className="text-sm font-medium text-white/50 mb-2 block uppercase tracking-wider">Telegram Username</label>
                      <input
                        type="text"
                        placeholder="@username"
                        value={data.telegram}
                        onChange={(e) => updateData('telegram', e.target.value)}
                        className="w-full bg-transparent border-b-2 border-white/20 text-2xl pb-3 focus:outline-none focus:border-shoqan-primary transition-colors placeholder:text-white/20 font-light"
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
            "flex items-center gap-2 px-6 py-4 rounded-full text-lg font-medium transition-all",
            step === 1 ? "opacity-0 pointer-events-none" : "text-white/50 hover:text-white hover:bg-white/5"
          )}
        >
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        
        <button
          onClick={nextStep}
          disabled={step === 1 && !data.role}
          className="flex items-center gap-2 px-10 py-4 bg-shoqan-primary text-[#0a110e] hover:bg-emerald-400 rounded-full text-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {step === totalSteps ? "Complete Profile" : "Continue"}
          {step === totalSteps ? <Check className="w-5 h-5 ml-2" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
