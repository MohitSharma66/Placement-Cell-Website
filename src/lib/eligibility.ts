// Eligibility checking logic for job applications

export interface StudentProfile {
  cgpa: number;
  experience: number; // in months
  branch: string;
}

export interface JobRequirements {
  minCgpa: number;
  minExperience: number; // in months
  requiredBranches: string[];
}

export interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
  missingRequirements: {
    cgpa?: { required: number; current: number };
    experience?: { required: number; current: number };
    branch?: { required: string[]; current: string };
  };
}

/**
 * Check if a student is eligible to apply for a specific job
 * @param student - Student's profile information
 * @param job - Job requirements
 * @returns EligibilityResult with detailed eligibility information
 */
export function checkEligibility(
  student: StudentProfile,
  job: JobRequirements
): EligibilityResult {
  const reasons: string[] = [];
  const missingRequirements: EligibilityResult['missingRequirements'] = {};
  let isEligible = true;

  // Validate and normalize inputs with defaults
  const studentCgpa = isNaN(student.cgpa) ? 0 : student.cgpa;
  const studentExperience = isNaN(student.experience) ? 0 : student.experience;
  const studentBranch = (student.branch || '').toLowerCase().trim();
  
  const jobMinCgpa = isNaN(job.minCgpa) ? 0 : job.minCgpa;
  const jobMinExperience = isNaN(job.minExperience) ? 0 : job.minExperience;
  const jobRequiredBranches = job.requiredBranches || [];

  // Check CGPA requirement
  if (studentCgpa < jobMinCgpa) {
    isEligible = false;
    reasons.push(`CGPA requirement not met (Required: ${jobMinCgpa}, Current: ${studentCgpa})`);
    missingRequirements.cgpa = {
      required: jobMinCgpa,
      current: studentCgpa
    };
  }

  // Check experience requirement
  if (studentExperience < jobMinExperience) {
    isEligible = false;
    reasons.push(`Experience requirement not met (Required: ${jobMinExperience} months, Current: ${studentExperience} months)`);
    missingRequirements.experience = {
      required: jobMinExperience,
      current: studentExperience
    };
  }

  // Check branch requirement (case-insensitive)
  // If requiredBranches is empty or undefined, treat as wildcard (all branches allowed)
  if (jobRequiredBranches.length > 0) {
    const requiredBranchesLower = jobRequiredBranches.map(branch => (branch || '').toLowerCase().trim());
    
    if (!requiredBranchesLower.includes(studentBranch)) {
      isEligible = false;
      reasons.push(`Branch requirement not met (Required: ${jobRequiredBranches.join(', ')}, Current: ${student.branch})`);
      missingRequirements.branch = {
        required: jobRequiredBranches,
        current: student.branch
      };
    }
  }

  return {
    isEligible,
    reasons,
    missingRequirements
  };
}

/**
 * Filter jobs based on student eligibility
 * @param jobs - Array of jobs with requirements
 * @param student - Student profile
 * @returns Array of jobs the student is eligible for
 */
export function filterEligibleJobs<T extends JobRequirements>(
  jobs: T[],
  student: StudentProfile
): T[] {
  return jobs.filter(job => checkEligibility(student, job).isEligible);
}

/**
 * Get human-readable eligibility status for display
 * @param eligibilityResult - Result from checkEligibility
 * @returns User-friendly status message
 */
export function getEligibilityStatusMessage(eligibilityResult: EligibilityResult): string {
  if (eligibilityResult.isEligible) {
    return "✅ You are eligible to apply for this position";
  }

  if (eligibilityResult.reasons.length === 1) {
    return `❌ ${eligibilityResult.reasons[0]}`;
  }

  return `❌ Multiple requirements not met:\n${eligibilityResult.reasons.map(reason => `• ${reason}`).join('\n')}`;
}