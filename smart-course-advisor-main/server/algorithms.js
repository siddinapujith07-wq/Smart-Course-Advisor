const courses = [
  { id: "AI201", name: "Artificial Intelligence", domain: "AI/ML", difficulty: 72, credits: 4, prereqs: ["DS101"], demand: 94, skills: ["Python", "Problem Solving"] },
  { id: "ML301", name: "Machine Learning", domain: "AI/ML", difficulty: 82, credits: 4, prereqs: ["AI201", "ST201"], demand: 98, skills: ["Python", "Statistics"] },
  { id: "DL401", name: "Deep Learning", domain: "AI/ML", difficulty: 90, credits: 4, prereqs: ["ML301"], demand: 96, skills: ["Python", "Statistics"] },
  { id: "NLP330", name: "Natural Language Processing", domain: "AI/ML", difficulty: 84, credits: 3, prereqs: ["ML301"], demand: 92, skills: ["Python", "Communication"] },
  { id: "DS101", name: "Data Structures", domain: "Software Job", difficulty: 58, credits: 4, prereqs: [], demand: 95, skills: ["Problem Solving", "Java"] },
  { id: "DB210", name: "Database Systems", domain: "Data Science", difficulty: 62, credits: 3, prereqs: ["DS101"], demand: 88, skills: ["SQL", "Problem Solving"] },
  { id: "ST201", name: "Probability and Statistics", domain: "Data Science", difficulty: 68, credits: 3, prereqs: [], demand: 91, skills: ["Statistics"] },
  { id: "WEB220", name: "Full Stack Development", domain: "Web Development", difficulty: 60, credits: 3, prereqs: ["DS101"], demand: 93, skills: ["JavaScript", "React"] },
  { id: "APP315", name: "Mobile App Development", domain: "App Development", difficulty: 67, credits: 3, prereqs: ["DS101"], demand: 88, skills: ["JavaScript", "UI Design"] },
  { id: "CLOUD320", name: "Cloud Computing", domain: "Cloud Computing", difficulty: 70, credits: 3, prereqs: ["DB210"], demand: 91, skills: ["Cloud", "SQL"] },
  { id: "SEC310", name: "Cyber Security", domain: "Cyber Security", difficulty: 74, credits: 3, prereqs: ["DS101"], demand: 90, skills: ["Networking", "Problem Solving"] },
  { id: "HCI260", name: "Human Computer Interaction", domain: "Web Development", difficulty: 50, credits: 2, prereqs: [], demand: 80, skills: ["UI Design", "Communication"] }
];

const careerDomains = {
  "Software Job": ["Web Development", "App Development", "Cloud Computing", "Software Job"],
  "Higher Studies": ["AI/ML", "Data Science"],
  Startup: ["Web Development", "App Development", "Cloud Computing"],
  Research: ["AI/ML", "Data Science"]
};

const defaultProfile = {
  name: "Student",
  branch: "Computer Science",
  year: "2nd Year",
  cgpa: 8.2,
  interests: ["AI/ML"],
  completed: ["DS101", "ST201", "AI201"],
  certifications: [],
  grades: {},
  skills: { Python: 3, "Problem Solving": 3 },
  careerGoal: "Software Job",
  studyHours: 10
};

function cleanProfile(input = {}) {
  return {
    ...defaultProfile,
    ...input,
    interests: input.interests?.length ? input.interests : defaultProfile.interests,
    completed: input.completed ?? defaultProfile.completed,
    certifications: input.certifications ?? [],
    grades: input.grades ?? {},
    skills: input.skills ?? defaultProfile.skills
  };
}

function interestMatch(course, profile) {
  if (profile.interests.includes(course.domain)) return 100;
  if ((careerDomains[profile.careerGoal] ?? []).includes(course.domain)) return 74;
  if (course.domain === "Software Job") return 62;
  return 40;
}

function readiness(course, profile) {
  const prereqRatio = course.prereqs.length === 0
    ? 1
    : course.prereqs.filter((id) => profile.completed.includes(id)).length / course.prereqs.length;
  const skillValues = course.skills.map((skill) => Number(profile.skills[skill] ?? 1));
  const skillRatio = skillValues.reduce((sum, value) => sum + value, 0) / (course.skills.length * 5);
  const gradeBonus = course.prereqs.reduce((sum, id) => sum + (Number(profile.grades[id] ?? 0) >= 80 ? 4 : 0), 0);
  return Math.min(100, Math.round(prereqRatio * 54 + skillRatio * 38 + gradeBonus));
}

function certificationBoost(course, profile) {
  const terms = profile.certifications.join(" ").toLowerCase();
  const key = course.domain.toLowerCase().split(" ")[0];
  return terms.includes(key) || course.skills.some((skill) => terms.includes(skill.toLowerCase())) ? 8 : 0;
}

function successProbability(course, profile, skillReadiness) {
  const cgpa = Math.min(Number(profile.cgpa) / 10, 1);
  const capacity = Math.min(Number(profile.studyHours) / 18, 1);
  const difficulty = course.difficulty / 100;
  const result = 28 + cgpa * 31 + capacity * 17 + skillReadiness * 0.3 - difficulty * 20 + certificationBoost(course, profile);
  return Math.max(28, Math.min(97, Math.round(result)));
}

function careerRelevance(course, profile) {
  const relevant = (careerDomains[profile.careerGoal] ?? []).includes(course.domain);
  return relevant ? 94 : profile.interests.includes(course.domain) ? 82 : 61;
}

function learningPath(course, profile) {
  const missing = course.prereqs.filter((id) => !profile.completed.includes(id));
  if (missing.length) return `Complete ${missing.join(" and ")} before taking this course.`;
  if (course.difficulty >= 82) return `Ready to start; reserve ${Math.max(8, profile.studyHours)} focused hours weekly.`;
  return "Ready to include in your next semester plan.";
}

function skillAdvice(course, profile) {
  const weak = course.skills.filter((skill) => Number(profile.skills[skill] ?? 0) < 3);
  return weak.length ? `Improve ${weak.join(" and ")} for stronger results.` : `Your ${course.skills.join(" and ")} skills support this choice.`;
}

export function recommend(rawProfile) {
  const profile = cleanProfile(rawProfile);
  return courses
    .filter((course) => !profile.completed.includes(course.id))
    .map((course) => {
      const match = interestMatch(course, profile);
      const skillReadiness = readiness(course, profile);
      const success = successProbability(course, profile, skillReadiness);
      const career = careerRelevance(course, profile);
      const score = Math.round(match * 0.29 + skillReadiness * 0.22 + success * 0.26 + career * 0.18 + certificationBoost(course, profile));
      const reasons = [
        match >= 85 ? `Matches your interest in ${course.domain}.` : `Builds useful knowledge for your ${profile.careerGoal.toLowerCase()} goal.`,
        skillReadiness >= 70 ? "Your completed learning and skills provide a good foundation." : "Recommended with a short foundation-building plan.",
        skillAdvice(course, profile)
      ];
      return {
        ...course,
        finalScore: score,
        interestMatch: match,
        skillReadiness,
        success,
        careerRelevance: career,
        careerLabel: career >= 85 ? "High relevance" : "Useful complement",
        path: learningPath(course, profile),
        reasons
      };
    })
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, 6);
}

export function dashboard(rawProfile) {
  const profile = cleanProfile(rawProfile);
  const recommendations = recommend(profile);
  const skills = Object.entries(profile.skills);
  const strengths = skills.filter(([, rating]) => Number(rating) >= 4).map(([name]) => name);
  const weakAreas = skills.filter(([, rating]) => Number(rating) <= 2).map(([name]) => name);
  const domains = [...new Set(recommendations.slice(0, 4).map((course) => course.domain))];
  const average = Math.round(recommendations.reduce((sum, course) => sum + course.success, 0) / recommendations.length);
  return {
    greeting: `Welcome, ${profile.name || "Student"}`,
    recommendedDomains: domains,
    strengths: strengths.length ? strengths : ["Developing foundational skills"],
    weakAreas: weakAreas.length ? weakAreas : ["No major gaps reported"],
    careerSuggestions: [
      `${profile.careerGoal}: focus on ${domains[0] ?? "core subjects"} courses.`,
      profile.certifications.length ? "Add your certification projects to your portfolio." : "Start one beginner certification alongside your next course."
    ],
    progressInsights: [
      `${average}% average predicted success across your top recommendations.`,
      `${profile.studyHours} weekly study hours planned for the next learning path.`
    ],
    successAverage: average,
    bars: recommendations.map((item) => ({ label: item.id, value: item.success }))
  };
}

export function timetable(rawProfile) {
  const profile = cleanProfile(rawProfile);
  const selected = recommend(profile)
    .filter((course) => !course.path.startsWith("Complete "))
    .slice(0, profile.studyHours < 7 ? 3 : 4);
  const sessions = profile.studyHours < 7
    ? ["Tue 5:00 PM", "Thu 5:00 PM", "Sat 10:00 AM"]
    : ["Mon 5:00 PM", "Wed 5:00 PM", "Fri 4:00 PM", "Sat 10:00 AM"];
  return selected.map((course, index) => ({
    course: course.name,
    code: course.id,
    slot: sessions[index],
    hours: `${Math.max(2, Math.floor(profile.studyHours / selected.length))} hrs`,
    mode: index % 2 === 0 ? "Guided Study" : "Practice Lab",
    focus: course.path
  }));
}

export function stats(profile) {
  return dashboard(profile);
}

export function chatReply(message) {
  const lower = message.toLowerCase();
  if (lower.includes("recommend") || lower.includes("course")) {
    return "Your recommendations are chosen from your interests, previous subjects, skills, grades, available study hours, and career goal. Complete the survey carefully for more useful suggestions.";
  }
  if (lower.includes("skill") || lower.includes("weak")) {
    return "Your dashboard highlights skills you rated strongly and areas that need improvement. A useful next step is to practice one weak skill alongside the recommended course each week.";
  }
  if (lower.includes("career") || lower.includes("job")) {
    return "Choose a career goal during onboarding. The advisor then prioritizes courses relevant to software jobs, higher studies, startup work, or research.";
  }
  if (lower.includes("timetable") || lower.includes("schedule")) {
    return "The timetable is created from your top recommended courses and the weekly study hours you provided, so the plan stays manageable.";
  }
  return "Hello! I can help you understand your recommendations, improve weak skills, plan study time, or connect courses with your career goal.";
}

export { courses, defaultProfile };
