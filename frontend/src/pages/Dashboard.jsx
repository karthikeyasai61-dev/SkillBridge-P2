import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineAcademicCap,
  HiOutlineBookOpen,
  HiOutlineRocketLaunch,
  HiOutlineClipboardDocumentCheck,
  HiOutlineTrophy,
  HiOutlineArrowTrendingUp,
} from 'react-icons/hi2';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadialBarChart, RadialBar,
} from 'recharts';

const iconMap = {
  green: HiOutlineBookOpen,
  blue: HiOutlineClipboardDocumentCheck,
  orange: HiOutlineRocketLaunch,
  pink: HiOutlineAcademicCap,
};

export default function Dashboard() {
  const navigate = useNavigate();
  
  // 1. Target career role
  const selectedRole = localStorage.getItem('selectedRole') || '';

  // 2. Skills Learned
  const [assessedSkills, setAssessedSkills] = useState({});
  useEffect(() => {
    try {
      const stored = localStorage.getItem('assessedSkills');
      if (stored) setAssessedSkills(JSON.parse(stored));
    } catch (e) {}
  }, []);
  const skillsLearned = Object.values(assessedSkills).filter(Boolean).length;

  // 3. Courses Completed
  const [userCourses, setUserCourses] = useState([]);
  useEffect(() => {
    try {
      const stored = localStorage.getItem('userCourses');
      if (stored) setUserCourses(JSON.parse(stored));
    } catch (e) {}
  }, []);
  const totalCourses = userCourses.length;
  const completedCourses = userCourses.filter(c => c.status === 'completed').length;
  const inProgressCourses = userCourses.filter(c => c.status === 'in-progress').length;
  const notStartedCourses = userCourses.filter(c => c.status === 'not-started').length;

  // 4. Test Scores & Interviews
  const [completedTests, setCompletedTests] = useState([]);
  const [mockInterviewRounds, setMockInterviewRounds] = useState([]);
  useEffect(() => {
    try {
      const tests = localStorage.getItem('completedTests');
      if (tests) setCompletedTests(JSON.parse(tests));
      
      const interviews = localStorage.getItem('mockInterviewRounds');
      if (interviews) setMockInterviewRounds(JSON.parse(interviews));
    } catch (e) {}
  }, []);

  const completedInterviews = mockInterviewRounds.filter(r => r.status === 'completed');
  
  let totalScoreSum = 0;
  let scoreCount = 0;
  completedTests.forEach(t => { totalScoreSum += t.score; scoreCount++; });
  completedInterviews.forEach(i => { totalScoreSum += i.score; scoreCount++; });
  const avgTestScore = scoreCount > 0 ? Math.round(totalScoreSum / scoreCount) : 0;

  // 5. Job Readiness Score
  const baseReadiness = parseInt(localStorage.getItem('jobReadinessBase')) || 0;
  let jobReadiness = 0;
  if (baseReadiness > 0) {
    jobReadiness = Math.min(100, Math.round(baseReadiness + (completedCourses * 5) + (completedInterviews.length * 5)));
  } else {
    // If onboarding not completed, calculate purely from achievements
    const achievements = (completedCourses * 10) + (completedInterviews.length * 10) + (skillsLearned > 0 ? 15 : 0);
    jobReadiness = Math.min(100, achievements);
  }

  // 6. Skill Proficiency Data
  const skillData = Object.entries(assessedSkills).map(([name, known]) => ({
    name,
    score: known ? 100 : 30
  })).slice(0, 8);

  // 7. Course Progress Chart
  const courseProgress = [
    { name: 'Completed', value: completedCourses, color: '#10b981' },
    { name: 'In Progress', value: inProgressCourses, color: '#00f5ff' },
    { name: 'Not Started', value: notStartedCourses, color: 'rgba(255, 255, 255, 0.15)' },
  ].filter(item => item.value > 0 || totalCourses === 0);

  // Fallback if empty to make Recharts happy
  const finalCourseProgress = courseProgress.length > 0 ? courseProgress : [
    { name: 'Completed', value: 0, color: '#10b981' },
    { name: 'In Progress', value: 0, color: '#00f5ff' },
    { name: 'Not Started', value: 1, color: 'rgba(255, 255, 255, 0.15)' },
  ];

  // 8. Readiness Data
  const readinessData = [{ name: 'Score', value: jobReadiness, fill: '#00f5ff' }];

  // 9. Recent Activities
  const [recentActivities, setRecentActivities] = useState([]);
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentActivities');
      if (stored) {
        setRecentActivities(JSON.parse(stored));
      } else {
        setRecentActivities([
          { icon: HiOutlineBookOpen, text: 'Welcome to Skill Bridge! Start your career onboarding path.', time: 'Just now', color: 'blue' }
        ]);
      }
    } catch (e) {}
  }, []);

  // 10. Upcoming Tasks
  const upcomingTasks = [];
  if (!selectedRole) {
    upcomingTasks.push({ title: 'Select a Target Career Path', type: 'Career', due: 'Today', priority: 'orange' });
  }
  const onboardingCompleted = localStorage.getItem('analysisResult') !== null;
  if (!onboardingCompleted) {
    upcomingTasks.push({ title: 'Complete AI Career Onboarding', type: 'Onboarding', due: 'Today', priority: 'blue' });
  }
  if (skillsLearned === 0) {
    upcomingTasks.push({ title: 'Self-Assess Your Core Skills', type: 'Skills', due: 'Tomorrow', priority: 'green' });
  }
  if (completedTests.length === 0) {
    upcomingTasks.push({ title: 'Take an Assessment Test', type: 'Evaluation', due: 'In 3 days', priority: 'blue' });
  }
  // In-progress courses
  const inProgressList = userCourses.filter(c => c.status === 'in-progress');
  inProgressList.forEach(c => {
    upcomingTasks.push({ title: `Continue: ${c.title}`, type: 'Course', due: 'Soon', priority: 'green' });
  });
  if (!localStorage.getItem('resumeBuilt')) {
    upcomingTasks.push({ title: 'Build and Download Resume', type: 'Resume', due: 'Next week', priority: 'pink' });
  }
  if (upcomingTasks.length === 0) {
    upcomingTasks.push({ title: 'Take Mock Interviews to practice', type: 'Interview', due: 'Anytime', priority: 'blue' });
    upcomingTasks.push({ title: 'Solve advanced coding challenges', type: 'Coding', due: 'Weekly', priority: 'orange' });
  }

  return (
    <div className="animate-fade-in" style={{ position: 'relative', zIndex: 10 }}>
      {/* Target Career Banner */}
      {selectedRole && (
        <div className="card glass-card" style={{ marginBottom: 24, padding: '20px 28px', background: 'linear-gradient(135deg, rgba(0,82,255,0.06), rgba(236,72,153,0.06))', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Target Career Path</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: 4, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>{selectedRole}</h2>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/career-selection')} style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '8px 16px', fontWeight: 600 }}>Change Path</button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="stat-icon blue" style={{ background: 'var(--color-primary-bg)', color: 'var(--color-primary)', width: '52px', height: '52px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}><HiOutlineAcademicCap /></div>
          <div className="stat-info" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>{skillsLearned}</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>Skills Learned</p>
            <span className="stat-trend up" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', width: 'fit-content', marginTop: '2px', fontWeight: 500 }}>{skillsLearned > 0 ? `↑ ${skillsLearned} Assessed` : 'Assess Skills'}</span>
          </div>
        </div>
        <div className="stat-card glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="stat-icon green" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', width: '52px', height: '52px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}><HiOutlineBookOpen /></div>
          <div className="stat-info" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-success)', margin: 0, lineHeight: 1 }}>{completedCourses}/{totalCourses}</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>Courses Completed</p>
            <span className="stat-trend up" style={{ background: 'var(--color-primary-bg)', color: 'var(--color-primary)', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', width: 'fit-content', marginTop: '2px', fontWeight: 500 }}>{totalCourses > 0 ? `${Math.round((completedCourses / totalCourses) * 100)}% done` : '0%'}</span>
          </div>
        </div>
        <div className="stat-card glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="stat-icon orange" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)', width: '52px', height: '52px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}><HiOutlineClipboardDocumentCheck /></div>
          <div className="stat-info" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-warning)', margin: 0, lineHeight: 1 }}>{avgTestScore}%</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>Avg Test Score</p>
            <span className="stat-trend up" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', width: 'fit-content', marginTop: '2px', fontWeight: 500 }}>{completedTests.length > 0 ? `Based on ${completedTests.length} tests` : 'No tests yet'}</span>
          </div>
        </div>
        <div className="stat-card glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="stat-icon pink" style={{ background: 'rgba(236,72,153,0.08)', color: 'var(--color-accent)', width: '52px', height: '52px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}><HiOutlineTrophy /></div>
          <div className="stat-info" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-accent)', margin: 0, lineHeight: 1 }}>{jobReadiness}%</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>Job Readiness</p>
            <span className="stat-trend up" style={{ background: 'rgba(236,72,153,0.08)', color: 'var(--color-accent)', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', width: 'fit-content', marginTop: '2px', fontWeight: 500 }}>Diagnostics Active</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card glass-card" style={{ padding: '24px' }}>
          <div className="card-header" style={{ marginBottom: 20 }}>
            <div>
              <div className="card-title" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Skill Proficiency
              </div>
              <div className="card-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>Your scores across key skills</div>
            </div>
          </div>
          {skillData.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 250, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12, opacity: 0.5 }}>📊</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>No Skill Data Available</div>
              <p style={{ fontSize: '0.8rem', maxWidth: 280, color: 'var(--text-secondary)' }}>Complete the skills self-assessment or onboarding profile to visualize your skill proficiency.</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => navigate('/career-selection')}>Choose Target Career</button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={skillData} barSize={20}>
                <defs>
                  <linearGradient id="colorSkillGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
                  contentStyle={{ background: 'rgba(13, 15, 30, 0.95)', border: '1px solid var(--border-color)', borderRadius: '12px', color: '#fff', boxShadow: 'var(--shadow-lg)' }}
                />
                <Bar dataKey="score" fill="url(#colorSkillGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card glass-card" style={{ padding: '24px' }}>
          <div className="card-header" style={{ marginBottom: 20 }}>
            <div>
              <div className="card-title" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Course Completion
              </div>
              <div className="card-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>Overall progress overview</div>
            </div>
          </div>
          {totalCourses === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 250, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12, opacity: 0.5 }}>📚</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>No Courses Enrolled</div>
              <p style={{ fontSize: '0.8rem', maxWidth: 280, color: 'var(--text-secondary)' }}>Go to the Courses section or complete onboarding to get personalized learning courses.</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => navigate('/courses')}>Explore Courses</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, height: 250, flexWrap: 'wrap' }}>
              <ResponsiveContainer width={150} height={150}>
                <PieChart>
                  <Pie data={finalCourseProgress} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={4} dataKey="value">
                    {finalCourseProgress.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {finalCourseProgress.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }}></span>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                    <span style={{ fontWeight: 600, marginLeft: 4, color: 'var(--text-primary)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid-2">
        {/* Job Readiness Score */}
        <div className="card glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header" style={{ marginBottom: 12 }}>
              <div>
                <div className="card-title" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Readiness Telemetry
                </div>
                <div className="card-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>How prepared you are for the industry</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', margin: '20px 0' }}>
              <ResponsiveContainer width={180} height={180}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="95%" startAngle={90} endAngle={-270} data={readinessData}>
                  <RadialBar background={{ fill: 'rgba(255,255,255,0.03)' }} clockWise dataKey="value" cornerRadius={6} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--color-primary)' }}>{jobReadiness}%</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: '2px' }}>Active Path</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
            <span className={`badge-tag ${skillsLearned > 0 ? 'green' : 'gray'}`} style={{ borderRadius: '6px', fontSize: '0.75rem', padding: '4px 10px' }}>Skills {skillsLearned > 0 ? '✓' : '⟳'}</span>
            <span className={`badge-tag ${localStorage.getItem('resumeBuilt') ? 'green' : 'gray'}`} style={{ borderRadius: '6px', fontSize: '0.75rem', padding: '4px 10px' }}>Resume {localStorage.getItem('resumeBuilt') ? '✓' : '⟳'}</span>
            <span className={`badge-tag ${completedInterviews.length > 0 ? 'green' : 'gray'}`} style={{ borderRadius: '6px', fontSize: '0.75rem', padding: '4px 10px' }}>Interviews {completedInterviews.length > 0 ? '✓' : '⟳'}</span>
          </div>
        </div>

        {/* Recent Activity + Upcoming */}
        <div className="card glass-card" style={{ padding: '24px' }}>
          <div className="card-header" style={{ marginBottom: 16 }}>
            <div className="card-title" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Recent Activity
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {recentActivities.slice(0, 4).map((act, i) => {
              const IconComp = iconMap[act.color] || HiOutlineBookOpen;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.85rem' }}>
                  <div className={`stat-icon ${act.color || 'blue'}`} style={{ width: 36, height: 36, fontSize: '1.1rem', flexShrink: 0, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                    <IconComp />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{act.text}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{act.time}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
            <div className="card-title" style={{ marginBottom: 12, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Upcoming Tasks
            </div>
            {upcomingTasks.slice(0, 3).map((task, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < upcomingTasks.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <div style={{ minWidth: 0, flex: 1, paddingRight: 12 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Due: {task.due}</div>
                </div>
                <span className={`badge-tag ${task.priority}`} style={{ borderRadius: '6px', fontSize: '0.7rem', padding: '2px 8px' }}>{task.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
