import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineChartBar,
  HiOutlineCodeBracket,
  HiOutlineCpuChip,
  HiOutlinePaintBrush,
  HiOutlineShieldCheck,
  HiOutlineCloud,
  HiOutlineDevicePhoneMobile,
  HiOutlineCircleStack,
  HiOutlineServer,
  HiOutlineGlobeAlt,
  HiOutlineCommandLine,
  HiOutlineCog,
  HiOutlineBolt,
  HiOutlineBuildingOffice,
  HiOutlineBuildingOffice2,
  HiOutlineBriefcase,
  HiOutlineWrenchScrewdriver,
  HiOutlineMap,
  HiOutlineTruck,
  HiOutlineRocketLaunch,
  HiOutlineUserPlus,
  HiOutlineDocumentCheck,
  HiOutlineClipboardDocumentList,
  HiOutlineBeaker,
  HiOutlineChatBubbleLeftRight,
  HiOutlineAcademicCap,
  HiOutlineSparkles,
  HiOutlineArrowRight,
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';

const computerScienceRoles = [
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    icon: HiOutlineChartBar,
    description: 'Analyze data to help businesses make informed decisions.',
    skills: ['Python', 'SQL', 'Excel', 'Tableau', 'Statistics'],
    demand: 'High',
    salary: '₹6 LPA - ₹12 LPA',
    color: '#4361ee',
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    icon: HiOutlineCircleStack,
    description: 'Build predictive models and extract insights from data.',
    skills: ['Python', 'Machine Learning', 'SQL', 'Statistics', 'Pandas'],
    demand: 'Very High',
    salary: '₹10 LPA - ₹25 LPA',
    color: '#118ab2',
  },
  {
    id: 'ai-engineer',
    title: 'AI Engineer',
    icon: HiOutlineCpuChip,
    description: 'Develop AI-powered applications and intelligent systems.',
    skills: ['Python', 'Deep Learning', 'TensorFlow', 'PyTorch', 'LLMs'],
    demand: 'Very High',
    salary: '₹12 LPA - ₹35 LPA',
    color: '#7209b7',
  },
  {
    id: 'ml-engineer',
    title: 'Machine Learning Engineer',
    icon: HiOutlineCpuChip,
    description: 'Design, train, and deploy machine learning models.',
    skills: ['Python', 'Scikit-Learn', 'TensorFlow', 'PyTorch', 'MLOps'],
    demand: 'Very High',
    salary: '₹10 LPA - ₹30 LPA',
    color: '#f72585',
  },
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    icon: HiOutlineCodeBracket,
    description: 'Build and maintain software applications and systems.',
    skills: ['Java', 'Python', 'DSA', 'Git', 'System Design'],
    demand: 'High',
    salary: '₹6 LPA - ₹25 LPA',
    color: '#06d6a0',
  },
  {
    id: 'full-stack-developer',
    title: 'Full Stack Developer',
    icon: HiOutlineCodeBracket,
    description: 'Develop both frontend and backend web applications.',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
    demand: 'High',
    salary: '₹6 LPA - ₹20 LPA',
    color: '#4361ee',
  },
  {
    id: 'frontend-developer',
    title: 'Frontend Developer',
    icon: HiOutlinePaintBrush,
    description: 'Create responsive and user-friendly interfaces.',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Tailwind CSS'],
    demand: 'High',
    salary: '₹5 LPA - ₹15 LPA',
    color: '#ff006e',
  },
  {
    id: 'backend-developer',
    title: 'Backend Developer',
    icon: HiOutlineServer,
    description: 'Build APIs, databases, and server-side applications.',
    skills: ['Node.js', 'Java', 'Python', 'SQL', 'MongoDB'],
    demand: 'High',
    salary: '₹7 LPA - ₹20 LPA',
    color: '#8338ec',
  },
  {
    id: 'cloud-engineer',
    title: 'Cloud Engineer',
    icon: HiOutlineCloud,
    description: 'Manage cloud infrastructure and deployments.',
    skills: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'Linux'],
    demand: 'Very High',
    salary: '₹8 LPA - ₹25 LPA',
    color: '#118ab2',
  },
  {
    id: 'cybersecurity-analyst',
    title: 'Cybersecurity Analyst',
    icon: HiOutlineShieldCheck,
    description: 'Protect systems and networks from cyber threats.',
    skills: ['Network Security', 'Linux', 'SIEM', 'Python', 'Ethical Hacking'],
    demand: 'Very High',
    salary: '₹6 LPA - ₹20 LPA',
    color: '#ef476f',
  },
  {
    id: 'devops-engineer',
    title: 'DevOps Engineer',
    icon: HiOutlineCog,
    description: 'Automate deployment and infrastructure management.',
    skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'],
    demand: 'Very High',
    salary: '₹8 LPA - ₹28 LPA',
    color: '#f77f00',
  },
  {
    id: 'data-engineer',
    title: 'Data Engineer',
    icon: HiOutlineCircleStack,
    description: 'Build and manage data pipelines and platforms.',
    skills: ['Python', 'SQL', 'Spark', 'Hadoop', 'ETL'],
    demand: 'Very High',
    salary: '₹8 LPA - ₹25 LPA',
    color: '#06d6a0',
  },
  {
    id: 'ui-ux-designer',
    title: 'UI/UX Designer',
    icon: HiOutlinePaintBrush,
    description: 'Design intuitive and engaging user experiences.',
    skills: ['Figma', 'Wireframing', 'Prototyping', 'Research', 'Design Systems'],
    demand: 'High',
    salary: '₹5 LPA - ₹18 LPA',
    color: '#ff006e',
  },
  {
    id: 'mobile-app-developer',
    title: 'Mobile App Developer',
    icon: HiOutlineDevicePhoneMobile,
    description: 'Build Android and iOS applications.',
    skills: ['Flutter', 'Dart', 'Firebase', 'Java', 'Kotlin'],
    demand: 'High',
    salary: '₹6 LPA - ₹18 LPA',
    color: '#ffd166',
  },
  {
    id: 'blockchain-developer',
    title: 'Blockchain Developer',
    icon: HiOutlineGlobeAlt,
    description: 'Develop decentralized applications and smart contracts.',
    skills: ['Solidity', 'Ethereum', 'Web3', 'JavaScript', 'Smart Contracts'],
    demand: 'Growing',
    salary: '₹10 LPA - ₹30 LPA',
    color: '#8338ec',
  },
  {
    id: 'prompt-engineer',
    title: 'Prompt Engineer',
    icon: HiOutlineCommandLine,
    description: 'Design and optimize prompts for AI systems.',
    skills: ['Prompt Engineering', 'LLMs', 'AI Tools', 'Python', 'NLP'],
    demand: 'Very High',
    salary: '₹10 LPA - ₹35 LPA',
    color: '#4361ee',
  },
  {
    id: 'mlops-engineer',
    title: 'MLOps Engineer',
    icon: HiOutlineCog,
    description: 'Deploy and monitor ML models in production.',
    skills: ['Python', 'Docker', 'Kubernetes', 'MLflow', 'CI/CD'],
    demand: 'Very High',
    salary: '₹12 LPA - ₹35 LPA',
    color: '#f77f00',
  },
  {
    id: 'generative-ai-engineer',
    title: 'Generative AI Engineer',
    icon: HiOutlineBolt,
    description: 'Build applications powered by LLMs and GenAI.',
    skills: ['Python', 'LangChain', 'RAG', 'LLMs', 'Vector Databases'],
    demand: 'Very High',
    salary: '₹15 LPA - ₹45 LPA',
    color: '#7209b7',
  },
  {
    id: 'business-intelligence-analyst',
    title: 'Business Intelligence Analyst',
    icon: HiOutlineChartBar,
    description: 'Convert business data into actionable insights.',
    skills: ['SQL', 'Power BI', 'Tableau', 'Excel', 'Data Modeling'],
    demand: 'High',
    salary: '₹6 LPA - ₹15 LPA',
    color: '#38b000',
  },
  {
    id: 'database-administrator',
    title: 'Database Administrator',
    icon: HiOutlineServer,
    description: 'Manage and optimize database systems.',
    skills: ['MySQL', 'PostgreSQL', 'Oracle', 'SQL', 'Backup & Recovery'],
    demand: 'High',
    salary: '₹6 LPA - ₹18 LPA',
    color: '#118ab2',
  },
  {
    id: 'site-reliability-engineer',
    title: 'Site Reliability Engineer',
    icon: HiOutlineShieldCheck,
    description: 'Ensure system reliability and scalability.',
    skills: ['Linux', 'Cloud', 'Python', 'Monitoring', 'Automation'],
    demand: 'Very High',
    salary: '₹12 LPA - ₹40 LPA',
    color: '#ef476f',
  },
  {
    id: 'computer-vision-engineer',
    title: 'Computer Vision Engineer',
    icon: HiOutlineCpuChip,
    description: 'Develop AI systems for image and video analysis.',
    skills: ['OpenCV', 'Python', 'PyTorch', 'CNNs', 'Deep Learning'],
    demand: 'High',
    salary: '₹10 LPA - ₹30 LPA',
    color: '#7209b7',
  },
  {
    id: 'nlp-engineer',
    title: 'NLP Engineer',
    icon: HiOutlineCommandLine,
    description: 'Build systems that understand human language.',
    skills: ['Python', 'Transformers', 'NLP', 'LLMs', 'PyTorch'],
    demand: 'Very High',
    salary: '₹12 LPA - ₹35 LPA',
    color: '#8338ec',
  },
  {
    id: 'ar-vr-developer',
    title: 'AR/VR Developer',
    icon: HiOutlineDevicePhoneMobile,
    description: 'Create immersive AR and VR experiences.',
    skills: ['Unity', 'C#', 'ARCore', 'VR Development', '3D Modeling'],
    demand: 'Growing',
    salary: '₹6 LPA - ₹20 LPA',
    color: '#ffd166',
  },
  {
    id: 'game-developer',
    title: 'Game Developer',
    icon: HiOutlineDevicePhoneMobile,
    description: 'Design and develop games for various platforms.',
    skills: ['C++', 'Unity', 'Unreal Engine', 'Game Physics', '3D Graphics'],
    demand: 'Growing',
    salary: '₹5 LPA - ₹18 LPA',
    color: '#f77f00',
  }
];

const electricalElectronicsRoles = [
  {
    id: 'ev-engineer',
    title: 'EV Engineer',
    icon: HiOutlineBolt,
    description: 'Electric vehicles are expanding rapidly worldwide, creating huge demand.',
    skills: ['Battery Management (BMS)', 'Motor Control', 'MATLAB', 'Simulation', 'EV Powertrain'],
    demand: 'Very High',
    salary: '₹6 LPA - ₹20 LPA',
    color: '#ffd166',
  },
  {
    id: 'power-electronics-engineer',
    title: 'Power Electronics Engineer',
    icon: HiOutlineBolt,
    description: 'Core technology behind EVs, renewable energy systems, and industrial automation.',
    skills: ['Inverters/Converters', 'Circuit Design', 'MATLAB', 'Thermal Management', 'SPICE'],
    demand: 'Very High',
    salary: '₹6 LPA - ₹18 LPA',
    color: '#ef476f',
  },
  {
    id: 'renewable-energy-engineer',
    title: 'Renewable Energy Engineer',
    icon: HiOutlineGlobeAlt,
    description: 'Solar, wind, and green energy sectors are among the fastest-growing industries.',
    skills: ['Solar PV Systems', 'Wind Turbines', 'Grid Integration', 'Energy Storage', 'Sustainability'],
    demand: 'Very High',
    salary: '₹5 LPA - ₹15 LPA',
    color: '#38b000',
  }
];

const electronicsCommunicationRoles = [
  {
    id: 'vlsi-engineer',
    title: 'VLSI Engineer',
    icon: HiOutlineCpuChip,
    description: "Design and verify semiconductor chips used in processors, smartphones, and AI hardware. India's semiconductor industry is booming with major investments and chip manufacturing initiatives.",
    skills: ['Verilog', 'VHDL', 'RTL Design', 'ASIC Design', 'FPGA'],
    demand: 'Extremely High',
    salary: '₹8 LPA - ₹30 LPA',
    color: '#7209b7',
  },
  {
    id: 'embedded-systems-engineer',
    title: 'Embedded Systems Engineer',
    icon: HiOutlineCog,
    description: 'Develop hardware-software solutions for smart devices and electronics. Used in automobiles, consumer electronics, medical devices, and IoT products.',
    skills: ['C', 'C++', 'Microcontrollers', 'RTOS', 'Embedded Linux'],
    demand: 'Very High',
    salary: '₹6 LPA - ₹18 LPA',
    color: '#06d6a0',
  },
  {
    id: 'telecommunications-engineer',
    title: 'Telecommunications Engineer',
    icon: HiOutlineGlobeAlt,
    description: 'Design and maintain communication networks including 5G and future wireless technologies. Growing demand due to 5G rollout and future 6G research.',
    skills: ['5G', 'Networking', 'RF Systems', 'Signal Processing', 'Telecom Protocols'],
    demand: 'Very High',
    salary: '₹5 LPA - ₹16 LPA',
    color: '#118ab2',
  },
  {
    id: 'iot-engineer',
    title: 'IoT Engineer',
    icon: HiOutlineDevicePhoneMobile,
    description: 'Build connected smart devices and automation systems. Smart homes, smart cities, healthcare, and industrial IoT are expanding rapidly.',
    skills: ['Arduino', 'ESP32', 'Embedded C', 'Sensors', 'Cloud Integration'],
    demand: 'Very High',
    salary: '₹5 LPA - ₹18 LPA',
    color: '#ffd166',
  },
  {
    id: 'robotics-engineer',
    title: 'Robotics Engineer',
    icon: HiOutlineCog,
    description: 'Develop intelligent robotic systems for manufacturing and automation. Automation is transforming industries worldwide.',
    skills: ['Robotics', 'ROS', 'Python', 'Embedded Systems', 'Control Systems'],
    demand: 'High',
    salary: '₹6 LPA - ₹20 LPA',
    color: '#ef476f',
  },
  {
    id: 'rf-design-engineer',
    title: 'RF Design Engineer',
    icon: HiOutlineCpuChip,
    description: 'Design radio frequency circuits and wireless communication systems. Essential for satellites, mobile networks, defense systems, and wireless communication.',
    skills: ['RF Design', 'Antenna Design', 'Microwave Engineering', 'ADS', 'Signal Analysis'],
    demand: 'High',
    salary: '₹6 LPA - ₹18 LPA',
    color: '#ff006e',
  }
];

const civilEngineeringRoles = [
  {
    id: 'structural-engineer',
    title: 'Structural Engineer',
    icon: HiOutlineBuildingOffice,
    description: 'Design and analyze buildings, bridges, and other structures. Essential for infrastructure and construction projects.',
    skills: ['AutoCAD', 'STAAD.Pro', 'ETABS', 'Structural Analysis', 'Reinforced Concrete Design'],
    demand: 'Very High',
    salary: '₹5 LPA - ₹18 LPA',
    color: '#8338ec',
  },
  {
    id: 'construction-project-manager',
    title: 'Construction Project Manager',
    icon: HiOutlineBriefcase,
    description: 'Plan, execute, and manage construction projects from start to finish. Large infrastructure projects require skilled project managers.',
    skills: ['Project Management', 'Primavera', 'MS Project', 'Cost Estimation', 'Leadership'],
    demand: 'Very High',
    salary: '₹6 LPA - ₹25 LPA',
    color: '#f77f00',
  },
  {
    id: 'transportation-engineer',
    title: 'Transportation Engineer',
    icon: HiOutlineMap,
    description: 'Design and improve highways, railways, airports, and transportation systems. Smart cities and transportation networks are expanding rapidly.',
    skills: ['Transportation Planning', 'AutoCAD Civil 3D', 'Traffic Engineering', 'GIS', 'Surveying'],
    demand: 'High',
    salary: '₹5 LPA - ₹15 LPA',
    color: '#118ab2',
  },
  {
    id: 'geotechnical-engineer',
    title: 'Geotechnical Engineer',
    icon: HiOutlineWrenchScrewdriver,
    description: 'Analyze soil and rock conditions for foundations and construction projects. Critical for safe construction and infrastructure development.',
    skills: ['Soil Mechanics', 'Foundation Design', 'Geology', 'PLAXIS', 'Site Investigation'],
    demand: 'High',
    salary: '₹5 LPA - ₹16 LPA',
    color: '#ef476f',
  },
  {
    id: 'environmental-engineer',
    title: 'Environmental Engineer',
    icon: HiOutlineGlobeAlt,
    description: 'Develop solutions for environmental protection and sustainable development. Governments and industries are investing heavily in sustainability.',
    skills: ['Environmental Impact Assessment', 'Waste Management', 'Water Treatment', 'GIS', 'Sustainability'],
    demand: 'Very High',
    salary: '₹5 LPA - ₹18 LPA',
    color: '#06d6a0',
  },
  {
    id: 'bim-engineer',
    title: 'BIM Engineer',
    icon: HiOutlineBuildingOffice2,
    description: 'Create and manage digital building models using BIM technologies. BIM is becoming the industry standard for modern construction projects.',
    skills: ['Revit', 'Navisworks', 'AutoCAD', 'BIM Modeling', 'Construction Planning'],
    demand: 'Very High',
    salary: '₹6 LPA - ₹20 LPA',
    color: '#7209b7',
  }
];

const mechanicalRoles = [
  {
    id: 'mechanical-design-engineer',
    title: 'Design Engineer',
    icon: HiOutlineWrenchScrewdriver,
    description: 'Design mechanical components, machines, and industrial products. Core role in manufacturing, automotive, aerospace, and product development.',
    skills: ['AutoCAD', 'SolidWorks', 'CATIA', 'GD&T', 'Mechanical Design'],
    demand: 'Very High',
    salary: '₹5 LPA - ₹18 LPA',
    color: '#f77f00',
  },
  {
    id: 'automotive-engineer',
    title: 'Automotive Engineer',
    icon: HiOutlineTruck,
    description: 'Design, develop, and test automobiles and vehicle systems. EVs and smart vehicles are driving huge growth in the automotive sector.',
    skills: ['CAD', 'Vehicle Dynamics', 'Powertrain', 'Automotive Systems', 'MATLAB'],
    demand: 'Very High',
    salary: '₹6 LPA - ₹20 LPA',
    color: '#ef476f',
  },
  {
    id: 'mechanical-robotics-engineer',
    title: 'Robotics Engineer',
    icon: HiOutlineCog,
    description: 'Develop robotic systems for manufacturing and automation. Industry 4.0 and automation are increasing demand for robotics experts.',
    skills: ['Robotics', 'Python', 'ROS', 'Automation', 'Control Systems'],
    demand: 'Very High',
    salary: '₹6 LPA - ₹22 LPA',
    color: '#118ab2',
  },
  {
    id: 'manufacturing-engineer',
    title: 'Manufacturing Engineer',
    icon: HiOutlineWrenchScrewdriver,
    description: 'Optimize production processes and improve manufacturing efficiency. Critical for improving productivity in factories and industries.',
    skills: ['Lean Manufacturing', 'Six Sigma', 'CAD/CAM', 'Process Optimization', 'Quality Control'],
    demand: 'High',
    salary: '₹5 LPA - ₹16 LPA',
    color: '#06d6a0',
  },
  {
    id: 'hvac-engineer',
    title: 'HVAC Engineer',
    icon: HiOutlineBolt,
    description: 'Design heating, ventilation, and air-conditioning systems. Growing demand in commercial buildings, smart cities, and infrastructure projects.',
    skills: ['HVAC Design', 'AutoCAD', 'Thermodynamics', 'Energy Management', 'Building Services'],
    demand: 'High',
    salary: '₹5 LPA - ₹15 LPA',
    color: '#ffd166',
  },
  {
    id: 'aerospace-engineer',
    title: 'Aerospace Engineer',
    icon: HiOutlineRocketLaunch,
    description: 'Design and develop aircraft, spacecraft, and related systems. Space technology and aviation sectors are expanding rapidly.',
    skills: ['Aerodynamics', 'CATIA', 'ANSYS', 'MATLAB', 'Structural Analysis'],
    demand: 'High',
    salary: '₹8 LPA - ₹25 LPA',
    color: '#7209b7',
  }
];

const pharmacyRoles = [
  {
    id: 'clinical-pharmacist',
    title: 'Clinical Pharmacist',
    icon: HiOutlineUserPlus,
    description: 'Work with doctors and patients to optimize medication therapy and improve patient outcomes. Hospitals increasingly require medication experts to improve patient safety.',
    skills: ['Pharmacology', 'Patient Counseling', 'Clinical Research', 'Drug Therapy', 'Communication'],
    demand: 'Very High',
    salary: '₹4 LPA - ₹12 LPA',
    color: '#ef476f',
  },
  {
    id: 'pharmacovigilance-specialist',
    title: 'Pharmacovigilance Specialist',
    icon: HiOutlineShieldCheck,
    description: 'Monitor, assess, and report adverse effects of medicines. Global pharmaceutical companies heavily invest in drug safety.',
    skills: ['Drug Safety', 'Medical Writing', 'Pharmacology', 'Regulatory Affairs', 'Data Analysis'],
    demand: 'Very High',
    salary: '₹5 LPA - ₹15 LPA',
    color: '#f77f00',
  },
  {
    id: 'regulatory-affairs-specialist',
    title: 'Regulatory Affairs Specialist',
    icon: HiOutlineDocumentCheck,
    description: 'Ensure pharmaceutical products comply with national and international regulations. Required for every drug approval and pharmaceutical product launch.',
    skills: ['FDA Guidelines', 'Documentation', 'Drug Regulations', 'Compliance', 'Quality Systems'],
    demand: 'High',
    salary: '₹6 LPA - ₹18 LPA',
    color: '#7209b7',
  },
  {
    id: 'clinical-research-associate',
    title: 'Clinical Research Associate',
    icon: HiOutlineClipboardDocumentList,
    description: 'Manage and monitor clinical trials for new medicines and treatments. India is a major hub for clinical research and drug development.',
    skills: ['Clinical Trials', 'GCP', 'Research', 'Documentation', 'Data Management'],
    demand: 'Very High',
    salary: '₹5 LPA - ₹16 LPA',
    color: '#118ab2',
  },
  {
    id: 'pharmaceutical-scientist',
    title: 'Pharmaceutical Scientist',
    icon: HiOutlineBeaker,
    description: 'Research and develop new drugs, formulations, and delivery systems. Innovation in medicine depends on pharmaceutical research.',
    skills: ['Pharmaceutical Chemistry', 'Research', 'Formulation Development', 'Analytics', 'Laboratory Techniques'],
    demand: 'High',
    salary: '₹6 LPA - ₹20 LPA',
    color: '#06d6a0',
  },
  {
    id: 'medical-affairs-specialist',
    title: 'Medical Affairs Specialist',
    icon: HiOutlineChatBubbleLeftRight,
    description: 'Bridge scientific knowledge between pharmaceutical companies and healthcare professionals. One of the fastest-growing and highest-paying pharmacy career paths.',
    skills: ['Medical Communication', 'Scientific Research', 'Presentation Skills', 'Pharmacology', 'Medical Writing'],
    demand: 'High',
    salary: '₹8 LPA - ₹25 LPA',
    color: '#ff006e',
  }
];

const onboardingSteps = [
  { id: 0, title: 'Educational Background', icon: HiOutlineAcademicCap, desc: 'Tell us about your education' },
  { id: 1, title: 'Current Skills', icon: HiOutlineCpuChip, desc: 'What skills do you already have?' },
  { id: 2, title: 'Technical Knowledge', icon: HiOutlineCpuChip, desc: 'Your technical expertise level' },
];

const onboardingFields = [
  { key: 'education', label: 'Educational Background', placeholder: 'e.g., B.Sc. Computer Science from XYZ University (2022-2026)...', hint: 'Include your degree, institution, year, stream, and any relevant academic achievements.', rows: 3 },
  { key: 'skills', label: 'Current Skills', placeholder: 'e.g., Python (intermediate), HTML/CSS (beginner), Excel (advanced)...', hint: 'List all skills you currently have with your proficiency level if possible.', rows: 3 },
  { key: 'technicalKnowledge', label: 'Technical Knowledge', placeholder: 'e.g., Python programming, SQL queries, OOP concepts, Git basics...', hint: 'Describe programming languages, tools, frameworks, and technical concepts you understand.', rows: 3 },
];

const CareerCard = ({ role, selected, onSelect, recommendedRoles, maxReached }) => {
  const isRecommended = recommendedRoles.some(
    (rName) => role.title.toLowerCase() === rName.toLowerCase() || role.id === rName.toLowerCase()
  );
  const isSel = Array.isArray(selected) ? selected.includes(role.id) : selected === role.id;
  const isDisabled = !isSel && maxReached;

  return (
    <div
      onClick={isDisabled ? undefined : onSelect}
      className="card"
      style={{
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.45 : 1,
        borderColor: isSel ? role.color : isRecommended ? '#4361ee' : undefined,
        borderWidth: isSel ? 2 : isRecommended ? 2 : 1,
        borderStyle: isRecommended && !isSel ? 'dashed' : 'solid',
        background: isSel ? `${role.color}12` : isRecommended ? 'rgba(67, 97, 238, 0.04)' : undefined,
        position: 'relative',
        transition: 'all 0.2s ease',
        boxShadow: isSel ? `0 0 0 3px ${role.color}30` : undefined,
      }}
    >
      {isSel && (
        <span style={{
          position: 'absolute',
          top: 10,
          left: 10,
          background: role.color,
          color: 'white',
          fontSize: '0.68rem',
          fontWeight: 700,
          padding: '3px 8px',
          borderRadius: '8px',
          zIndex: 10,
        }}>
          ✓ Selected
        </span>
      )}
      {isRecommended && (
        <span style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: isSel ? 'rgba(0,0,0,0.25)' : 'linear-gradient(135deg, #4361ee, #7209b7)',
          color: 'white',
          fontSize: '0.68rem',
          fontWeight: 700,
          padding: '3px 8px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: 10,
        }}>
          ✨ AI Recommended
        </span>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14, marginTop: isSel ? 22 : 0 }}>
        <div
          style={{
            width: 48, height: 48, borderRadius: 10,
            background: `${role.color}15`, color: role.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
          }}
        >
          <role.icon />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '1.02rem', paddingRight: isRecommended ? 90 : 0 }}>
            {role.title}
          </div>
          <span className={`badge-tag ${role.demand === 'Extremely High' || role.demand === 'Very High' ? 'green' : role.demand === 'High' ? 'blue' : 'orange'}`}>
            {role.demand} Demand
          </span>
        </div>
      </div>
      <p style={{ fontSize: '0.84rem', color: '#6b7280', marginBottom: 14 }}>{role.description}</p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {role.skills.map((s, i) => (
          <span key={i} className="badge-tag gray">{s}</span>
        ))}
      </div>
      <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>
        💰 Avg Salary: <strong style={{ color: '#1a1d2e' }}>{role.salary}</strong>
      </div>
    </div>
  );
};

export default function CareerSelection() {
  const [selected, setSelected] = useState([]);
  const [recommendedRoles, setRecommendedRoles] = useState([]);
  const navigate = useNavigate();
  const assessmentButtonRef = useRef(null);

  const handleRoleSelect = (roleId) => {
    setSelected(prev => {
      if (prev.includes(roleId)) {
        // Deselect if already selected
        return prev.filter(id => id !== roleId);
      }
      if (prev.length >= 2) {
        // Max 2 — ignore (cards will be greyed out)
        return prev;
      }
      const next = [...prev, roleId];
      setTimeout(() => {
        if (assessmentButtonRef.current) {
          assessmentButtonRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return next;
    });
  };

  // Onboarding wizard states
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingCurrent, setOnboardingCurrent] = useState(0);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [onboardingError, setOnboardingError] = useState('');
  const [onboardingForm, setOnboardingForm] = useState({
    education: '',
    skills: '',
    technicalKnowledge: '',
  });

  const allRoles = [
    ...computerScienceRoles,
    ...electricalElectronicsRoles,
    ...electronicsCommunicationRoles,
    ...civilEngineeringRoles,
    ...mechanicalRoles,
    ...pharmacyRoles,
  ];

  const recommendedRoleObjects = allRoles.filter(role => 
    recommendedRoles.some(
      (rName) => role.title.toLowerCase() === rName.toLowerCase() || role.id === rName.toLowerCase()
    )
  );

  useEffect(() => {
    // Show onboarding questionnaire if never completed
    const isCompleted = localStorage.getItem('onboardingCompleted');
    if (!isCompleted) {
      setShowOnboarding(true);
    }

    try {
      const stored = localStorage.getItem('recommendedRoles');
      if (stored) {
        const rolesList = JSON.parse(stored);
        setRecommendedRoles(rolesList || []);
        if (rolesList && rolesList.length > 0) {
          // Pre-select up to 2 recommended roles
          const preSelected = rolesList.slice(0, 2).reduce((acc, recName) => {
            const found = allRoles.find(
              (r) => r.title.toLowerCase() === recName.toLowerCase() || r.id === recName.toLowerCase()
            );
            if (found) acc.push(found.id);
            return acc;
          }, []);
          if (preSelected.length > 0) setSelected(preSelected);
        }
      }
    } catch (e) {
      console.error('Error loading AI recommendations:', e);
    }
  }, []);

  const handleOnboardingSubmit = async () => {
    setOnboardingLoading(true);
    setOnboardingError('');
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/onboarding/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(onboardingForm),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401 || data.error === 'Invalid token') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('onboardingCompleted');
          window.location.href = '/login';
          return;
        }
        if (res.status === 429) {
          throw new Error('⏳ AI quota limit reached. Please wait a few minutes and try again.');
        }
        throw new Error(data.error || 'Analysis failed');
      }
      
      // Store analysis in localStorage
      localStorage.setItem('analysisResult', JSON.stringify(data.analysis));

      // 1. Save recommendedRoles
      const recRoles = data.analysis.recommendedRoles || [];
      localStorage.setItem('recommendedRoles', JSON.stringify(recRoles));
      setRecommendedRoles(recRoles);

      // 2. Save selectedRole (default to the first recommended role)
      const dreamRole = recRoles[0] || 'Software Developer';
      localStorage.setItem('selectedRole', dreamRole);

      // 3. Save jobReadinessBase
      const readiness = parseInt(data.analysis.gapAnalysisReport?.overallReadiness) || 45;
      localStorage.setItem('jobReadinessBase', readiness.toString());

      // 4. Save assessedSkills (smart auto-detection based on user input skills)
      const userSkillsLower = (onboardingForm.skills || '').toLowerCase();
      const initialAssessed = {};
      (data.analysis.requiredSkills || []).forEach(s => {
        if (s && s.skill) {
          const name = s.skill;
          const isKnown = userSkillsLower.includes(name.toLowerCase());
          initialAssessed[name] = isKnown;
        }
      });
      localStorage.setItem('assessedSkills', JSON.stringify(initialAssessed));

      // 5. Log recent activity
      let activities = [];
      try {
        const stored = localStorage.getItem('recentActivities');
        if (stored) activities = JSON.parse(stored);
      } catch (e) {}
      const newAct = {
        text: 'Completed onboarding profile analysis',
        time: 'Just now',
        color: 'blue',
        timestamp: Date.now()
      };
      activities = [newAct, ...activities.filter(a => a.text !== newAct.text)];
      localStorage.setItem('recentActivities', JSON.stringify(activities.slice(0, 10)));

      // 6. Submit to backend endpoint to save skills in user profile DB
      try {
        await fetch(`${API_URL}/api/skills/assess`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
          body: JSON.stringify({ skillAssessment: initialAssessed }),
        });
      } catch (e) {
        console.error('Failed to submit initial skills assessment:', e);
      }

      localStorage.setItem('onboardingCompleted', 'true');
      setShowOnboarding(false);

      // Pre-select up to 2 recommended roles
      const preSelected = recRoles.slice(0, 2).reduce((acc, recName) => {
        const found = allRoles.find(
          (r) => r.title.toLowerCase() === recName.toLowerCase() || r.id === recName.toLowerCase()
        );
        if (found) acc.push(found.id);
        return acc;
      }, []);
      if (preSelected.length > 0) setSelected(preSelected);
    } catch (err) {
      setOnboardingError(err.message);
    } finally {
      setOnboardingLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Onboarding Questionnaire Modal */}
      {showOnboarding && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999,
          padding: '20px',
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            padding: '36px',
            maxWidth: '600px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  🚀 Profile Onboarding Analysis
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  Step {onboardingCurrent + 1} of {onboardingSteps.length}: {onboardingSteps[onboardingCurrent].title}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '3px', marginBottom: 24, overflow: 'hidden' }}>
              <div style={{ width: `${((onboardingCurrent + 1) / onboardingSteps.length) * 100}%`, height: '100%', background: '#4361ee', transition: 'width 0.3s ease' }}></div>
            </div>

            {/* Step Content */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                {onboardingFields[onboardingCurrent].label}
              </label>
              <textarea
                style={{
                  width: '100%',
                  minHeight: '120px',
                  background: 'var(--bg-input, #0f172a)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '14px',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  outline: 'none',
                  resize: 'vertical',
                }}
                value={onboardingForm[onboardingFields[onboardingCurrent].key]}
                onChange={(e) => setOnboardingForm({ ...onboardingForm, [onboardingFields[onboardingCurrent].key]: e.target.value })}
                placeholder={onboardingFields[onboardingCurrent].placeholder}
              />
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.4 }}>
                💡 {onboardingFields[onboardingCurrent].hint}
              </p>
            </div>

            {onboardingError && (
              <div style={{
                background: onboardingError.includes('quota') || onboardingError.includes('wait') ? 'rgba(251,146,60,0.1)' : 'rgba(239,71,111,0.1)',
                border: `1px solid ${onboardingError.includes('quota') || onboardingError.includes('wait') ? '#fb923c' : '#ef476f'}`,
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: 16,
                fontSize: '0.85rem',
                color: onboardingError.includes('quota') || onboardingError.includes('wait') ? '#ea580c' : '#ef476f',
                lineHeight: 1.5,
              }}>
                {onboardingError}
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <button
                className="btn btn-outline"
                onClick={() => {
                  if (onboardingCurrent > 0) setOnboardingCurrent(onboardingCurrent - 1);
                }}
                disabled={onboardingCurrent === 0 || onboardingLoading}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <HiOutlineArrowLeft /> Back
              </button>
              
              {onboardingCurrent < onboardingSteps.length - 1 ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setOnboardingCurrent(onboardingCurrent + 1)}
                  disabled={onboardingForm[onboardingFields[onboardingCurrent].key].trim().length < 3}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  Next <HiOutlineArrowRight />
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={handleOnboardingSubmit}
                  disabled={onboardingForm[onboardingFields[onboardingCurrent].key].trim().length < 3 || onboardingLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {onboardingLoading ? 'Analyzing...' : 'Submit & Analyze'} <HiOutlineCheckCircle />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="page-header">
        <h2>Choose Your Career Goal</h2>
        <p>Select the role you want to pursue. We'll create a personalized skill roadmap for you.</p>
      </div>

      {recommendedRoles && recommendedRoles.length > 0 && (
        <div style={{
          background: 'rgba(67, 97, 238, 0.08)',
          border: '1px dashed #4361ee',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12
        }}>
          <div>
            <h4 style={{ color: '#4361ee', fontWeight: 600, fontSize: '0.98rem', marginBottom: 4 }}>
              💡 AI Career Recommendations
            </h4>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
              Based on your onboarding analysis, the AI recommends: <strong>{recommendedRoles.join(', ')}</strong>.
            </p>
          </div>
          <button 
            className="btn btn-sm btn-outline"
            style={{ borderColor: '#4361ee', color: '#4361ee' }}
            onClick={() => {
              localStorage.removeItem('recommendedRoles');
              setRecommendedRoles([]);
            }}
          >
            Clear Recs
          </button>
        </div>
      )}

      {recommendedRoleObjects.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '2px solid #4361ee', paddingBottom: '8px' }}>
            <h3 style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: 0,
            }}>
              <span>✨</span> AI Recommended Careers
            </h3>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: selected.length >= 2 ? '#06d6a0' : '#4361ee',
              background: selected.length >= 2 ? 'rgba(6,214,160,0.1)' : 'rgba(67,97,238,0.1)',
              padding: '4px 10px',
              borderRadius: '20px',
              transition: 'all 0.3s ease',
            }}>
              {selected.length}/2 selected
            </span>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 16, marginTop: -8 }}>
            Pick up to <strong>2 roles</strong> to compare and pursue. Click a selected card to deselect it.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {recommendedRoleObjects.map((role) => (
              <CareerCard
                key={role.id}
                role={role}
                selected={selected}
                onSelect={() => handleRoleSelect(role.id)}
                recommendedRoles={recommendedRoles}
                maxReached={selected.length >= 2}
              />
            ))}
          </div>
        </div>
      )}

      {/* Computer Science Section */}
      <div style={{ marginBottom: 36 }}>
        <h3 style={{
          fontSize: '1.4rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '2px solid var(--border-color)',
          paddingBottom: '8px'
        }}>
          <span>💻</span> Computer Science
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {computerScienceRoles.map((role) => (
            <CareerCard
              key={role.id}
              role={role}
              selected={selected}
              onSelect={() => handleRoleSelect(role.id)}
              recommendedRoles={recommendedRoles}
            />
          ))}
        </div>
      </div>

      {/* Electrical & Electronics Section */}
      <div style={{ marginBottom: 36 }}>
        <h3 style={{
          fontSize: '1.4rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '2px solid var(--border-color)',
          paddingBottom: '8px'
        }}>
          <span>⚡</span> Electrical & Electronics
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {electricalElectronicsRoles.map((role) => (
            <CareerCard
              key={role.id}
              role={role}
              selected={selected}
              onSelect={() => handleRoleSelect(role.id)}
              recommendedRoles={recommendedRoles}
            />
          ))}
        </div>
      </div>

      {/* Electronics and Communication Section */}
      <div style={{ marginBottom: 36 }}>
        <h3 style={{
          fontSize: '1.4rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '2px solid var(--border-color)',
          paddingBottom: '8px'
        }}>
          <span>📡</span> Electronics and Communication
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {electronicsCommunicationRoles.map((role) => (
            <CareerCard
              key={role.id}
              role={role}
              selected={selected}
              onSelect={() => handleRoleSelect(role.id)}
              recommendedRoles={recommendedRoles}
            />
          ))}
        </div>
      </div>

      {/* Civil Engineering Section */}
      <div style={{ marginBottom: 36 }}>
        <h3 style={{
          fontSize: '1.4rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '2px solid var(--border-color)',
          paddingBottom: '8px'
        }}>
          <span>🏗️</span> Civil Engineering
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {civilEngineeringRoles.map((role) => (
            <CareerCard
              key={role.id}
              role={role}
              selected={selected}
              onSelect={() => handleRoleSelect(role.id)}
              recommendedRoles={recommendedRoles}
            />
          ))}
        </div>
      </div>

      {/* Mechanical Section */}
      <div style={{ marginBottom: 36 }}>
        <h3 style={{
          fontSize: '1.4rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '2px solid var(--border-color)',
          paddingBottom: '8px'
        }}>
          <span>⚙️</span> Mechanical
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {mechanicalRoles.map((role) => (
            <CareerCard
              key={role.id}
              role={role}
              selected={selected}
              onSelect={() => handleRoleSelect(role.id)}
              recommendedRoles={recommendedRoles}
            />
          ))}
        </div>
      </div>

      {/* Pharmacy Section */}
      <div style={{ marginBottom: 36 }}>
        <h3 style={{
          fontSize: '1.4rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '2px solid var(--border-color)',
          paddingBottom: '8px'
        }}>
          <span>🏥</span> Pharmacy
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {pharmacyRoles.map((role) => (
            <CareerCard
              key={role.id}
              role={role}
              selected={selected}
              onSelect={() => handleRoleSelect(role.id)}
              recommendedRoles={recommendedRoles}
            />
          ))}
        </div>
      </div>

      <div ref={assessmentButtonRef} style={{ marginTop: 28, marginBottom: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, transition: 'all 0.3s ease' }}>
        {selected.length > 0 && (
          <>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 4 }}>
              {selected.map(id => {
                const r = allRoles.find(x => x.id === id);
                return r ? (
                  <span key={id} style={{
                    background: `${r.color}15`,
                    color: r.color,
                    border: `1px solid ${r.color}40`,
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    <r.icon style={{ fontSize: '0.9rem' }} />
                    {r.title}
                    <button
                      onClick={() => handleRoleSelect(id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: r.color, padding: 0, marginLeft: 2, fontSize: '0.85rem', lineHeight: 1 }}
                      title="Remove"
                    >✕</button>
                  </span>
                ) : null;
              })}
            </div>
            <button className="btn btn-primary btn-lg animate-fade-in" onClick={() => {
              const primaryRole = allRoles.find(r => r.id === selected[0]);
              const allSelectedTitles = selected.map(id => allRoles.find(r => r.id === id)?.title).filter(Boolean);
              // Save primary role
              if (primaryRole) localStorage.setItem('selectedRole', primaryRole.title);
              // Save all selected roles
              localStorage.setItem('selectedRoles', JSON.stringify(allSelectedTitles));
              // Log activity
              let activities = [];
              try {
                const stored = localStorage.getItem('recentActivities');
                if (stored) activities = JSON.parse(stored);
              } catch (e) {}
              const newAct = {
                text: `Selected career path${allSelectedTitles.length > 1 ? 's' : ''}: ${allSelectedTitles.join(' & ')}`,
                time: 'Just now',
                color: 'orange',
                timestamp: Date.now()
              };
              activities = [newAct, ...activities.filter(a => a.text !== newAct.text)];
              localStorage.setItem('recentActivities', JSON.stringify(activities.slice(0, 10)));
              navigate('/skills-assessment', { state: { role: primaryRole ? primaryRole.title : 'Software Developer', roles: allSelectedTitles } });
            }}>
              Continue to Skills Assessment →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
