import { apiRequest, apiRequestOrNull, apiResponse } from './auth'

export type Page<T> = {
  items: T[]
  nextCursor: string | null
}

export type CandidateProfile = {
  profileId: string
  eTag: string
  personal: {
    preferredName: string | null
    firstName: string
    lastName: string
    email: string
    phoneNumber: string | null
    professionalTitle: string | null
    careerSummary: string | null
    currentLocation: string | null
    currentCountryCode: string | null
    linkedInUrl: string | null
    gitHubUrl: string | null
    portfolioUrl: string | null
    isOpenToWork: boolean
    noticePeriodDays: number | null
    willingToRelocate: boolean | null
    workAuthorization: string | null
  }
  experience: CandidateExperience[]
  education: CandidateEducation[]
  certifications: CandidateCertification[]
  skills: CandidateSkill[]
  projects: CandidateProject[]
  updatedAt: string
}

type CandidateProfileResponse = Omit<CandidateProfile, 'eTag'> & {
  eTag?: string
  etag?: string
}

export type CandidateExperience = {
  experienceId: string
  companyName: string
  jobTitle: string
  employmentType: string | null
  location: string | null
  startDate: string
  endDate: string | null
  isCurrentlyWorking: boolean
  description: string | null
  displayOrder: number
}

export type CandidateEducation = {
  educationId: string
  institutionName: string
  degree: string
  specialization: string | null
  educationLevel: string | null
  startDate: string | null
  endDate: string | null
  gradeType: string | null
  gradeValue: string | null
  description: string | null
  displayOrder: number
}

export type CandidateCertification = {
  certificationId: string
  certificationName: string
  issuingOrganization: string
  issueDate: string | null
  expiryDate: string | null
  doesNotExpire: boolean
  credentialId: string | null
  credentialUrl: string | null
  displayOrder: number
}

export type CandidateSkill = {
  userSkillId: string
  skillName: string
  normalizedSkillName: string
  skillCategory: string | null
  proficiencyLevel: string | null
  experienceMonths: number | null
  evidence: string | null
  isPrimary: boolean
}

export type CandidateProject = {
  projectId: string
  projectName: string
  role: string | null
  description: string | null
  projectUrl: string | null
  repositoryUrl: string | null
  startDate: string | null
  endDate: string | null
  isFeatured: boolean
  displayOrder: number
  technologies: string[]
}

export type UpdateCandidateProfileRequest = {
  personal: Omit<CandidateProfile['personal'], 'firstName' | 'lastName' | 'email' | 'phoneNumber'>
  experience: Array<Omit<CandidateExperience, 'experienceId'> & { experienceId: string | null }>
  education: Array<Omit<CandidateEducation, 'educationId'> & { educationId: string | null }>
  certifications: Array<Omit<CandidateCertification, 'certificationId'> & { certificationId: string | null }>
  skills: Array<Omit<CandidateSkill, 'userSkillId' | 'normalizedSkillName'> & { userSkillId: string | null }>
  projects: Array<Omit<CandidateProject, 'projectId'> & { projectId: string | null }>
}

export type ResumeImportJob = {
  importJobId: string
  originalFileName: string
  contentType: string
  fileSizeBytes: number
  importStatus: string
  completedAt: string | null
}

export type ResumeListItem = {
  resumeId: string
  resumeName: string
  targetJobTitle: string | null
  targetIndustry: string | null
  resumeKind: string
  isDefault: boolean
  isArchived: boolean
  currentVersionNumber: number
  importJob: ResumeImportJob
  createdAt: string
  updatedAt: string
}

export type Resume = ResumeListItem & {
  versions: Array<{
    resumeVersionId: string
    versionNumber: number
    versionLabel: string | null
    createdAt: string
  }>
}

export type ResumeListResponse = {
  items: ResumeListItem[]
}

export type ResumeUploadResponse = {
  resumeId: string
  importJobId: string
  originalFileName: string
  importStatus: string
}

export type JobSearchPreference = {
  preferenceId: string
  preferenceName: string
  jobTitles: string[] | null
  locations: string[] | null
  skills: string[] | null
  employmentTypes: string[] | null
  workModes: string[] | null
  minimumSalary: number | null
  salaryCurrency: string | null
  minimumExperienceMonths: number | null
  maximumExperienceMonths: number | null
  isEnabled: boolean
  discoveryFrequency: string
  nextRunAt: string | null
  updatedAt: string
}

export type JobSearchPreferenceList = {
  items: JobSearchPreference[]
}

export type UpsertJobSearchPreference = Omit<JobSearchPreference, 'preferenceId' | 'nextRunAt' | 'updatedAt'>

export type Job = {
  jobId: string
  title: string
  company: string
  location: string
  workMode?: string
  employmentType?: string
  source: string
  sourceUrl?: string
  postedAt?: string
  lastVerifiedAt?: string
  saved?: boolean
  savedAt?: string
  description?: string
  requirements?: string[]
}

export type JobMatch = {
  jobId: string
  profileVersion: number
  score: number
  summary: string
  matchedRequirements: string[]
  gaps: string[]
  calculatedAt: string
}

export type Application = {
  applicationId: string
  jobId: string
  company: string
  role: string
  source: string
  status: string
  appliedAt: string
  updatedAt?: string
}

export type ApplicationPreparation = {
  preparationId: string
  jobId: string
  resumeId: string
  version: number
  status: string
  answers: Array<{
    field: string
    value: string
    source: string
    sensitive: boolean
    confirmedByUser: boolean
  }>
  updatedAt: string
}

export type AutomationRun = {
  runId: string
  preparationId?: string
  status: string
  currentStep?: string
  startedAt?: string
  updatedAt: string
  applicationId?: string | null
  events?: Array<{ eventId: string; type: string; occurredAt: string; summary: string }>
}

export type ActivityEvent = {
  eventId: string
  category: string
  type: string
  occurredAt: string
  summary: string
  applicationId?: string
  runId?: string
}

export type DashboardSummary = {
  generatedAt: string
  profile: { completionPercent: number; missingFields: string[] } | null
  jobs: { savedCount: number; discoveredCount?: number } | null
  applications: { totalCount: number; byStatus: Record<string, number> } | null
  resumes: { totalCount: number; primaryResumeId: string | null } | null
  recentActivity: ActivityEvent[] | null
  dataStatus: Record<string, 'available' | 'unavailable'>
}

export type AppearanceSettings = {
  theme: 'light' | 'dark' | 'system'
  updatedAt: string
}

export type Integration = {
  provider: string
  status: 'not_connected' | 'pending' | 'connected' | string
}

export type ConnectionRequest = {
  providers: string[]
  otherProvider: string
  saved?: boolean
  updatedAt?: string
}

type QueryValue = string | number | boolean | undefined

function withQuery(path: string, values: Record<string, QueryValue>) {
  const query = new URLSearchParams()
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value))
  })
  const serialized = query.toString()
  return serialized ? `${path}?${serialized}` : path
}

export const getDashboardSummary = () =>
  apiRequest<DashboardSummary>('/api/v1/dashboard/summary')

export const getProfile = async (): Promise<CandidateProfile | null> => {
  const profile = await apiRequestOrNull<CandidateProfileResponse>('/api/v1/profile')
  if (!profile) return null
  const eTag = profile.eTag ?? profile.etag
  if (!eTag) throw new Error('The profile response did not include an ETag.')
  return { ...profile, eTag }
}

export const updateProfile = (profile: UpdateCandidateProfileRequest, eTag?: string) =>
  apiRequest<void>('/api/v1/profile', {
    method: 'PUT',
    headers: eTag ? { 'If-Match': eTag } : {},
    body: JSON.stringify(profile),
  })

export const listJobSearchPreferences = () =>
  apiRequestOrNull<JobSearchPreferenceList>('/api/v1/profile/preferences')

export const createJobSearchPreference = (preference: UpsertJobSearchPreference) =>
  apiRequest<JobSearchPreference>('/api/v1/profile/preferences', {
    method: 'POST',
    body: JSON.stringify(preference),
  })

export const updateJobSearchPreference = (preferenceId: string, preference: UpsertJobSearchPreference) =>
  apiRequest<JobSearchPreference>(`/api/v1/profile/preferences/${encodeURIComponent(preferenceId)}`, {
    method: 'PUT',
    body: JSON.stringify(preference),
  })

export const deleteJobSearchPreference = (preferenceId: string) =>
  apiRequest<void>(`/api/v1/profile/preferences/${encodeURIComponent(preferenceId)}`, {
    method: 'DELETE',
  })

export const listResumes = (page = 1, pageSize = 20) =>
  apiRequest<ResumeListResponse>(withQuery('/api/v1/resumes', { page, pageSize }))

export function uploadResume(file: File, options: { resumeName?: string; resumeKind?: string; setAsDefault?: boolean } = {}) {
  const body = new FormData()
  body.set('file', file)
  if (options.resumeName) body.set('resumeName', options.resumeName)
  if (options.resumeKind) body.set('resumeKind', options.resumeKind)
  if (options.setAsDefault !== undefined) body.set('setAsDefault', String(options.setAsDefault))
  return apiRequest<ResumeUploadResponse>('/api/v1/resumes', {
    method: 'POST',
    body,
  })
}

export const getResume = (resumeId: string) =>
  apiRequest<Resume>(`/api/v1/resumes/${encodeURIComponent(resumeId)}`)

export const setPrimaryResume = (resumeId: string) =>
  apiRequest<{ resumeId: string; isDefault: boolean; updatedAt: string }>(
    `/api/v1/resumes/${encodeURIComponent(resumeId)}/set-default`,
    { method: 'POST' },
  )

export const archiveResume = (resumeId: string) =>
  apiRequest<void>(
    `/api/v1/resumes/${encodeURIComponent(resumeId)}`,
    { method: 'DELETE' },
  )

export async function downloadResume(resumeId: string) {
  const response = await apiResponse(`/api/v1/resumes/${encodeURIComponent(resumeId)}/download`, {
    headers: { Accept: 'application/octet-stream' },
  })
  return response.blob()
}

export const searchJobs = (params: {
  q?: string
  location?: string
  workMode?: string
  employmentType?: string
  postedAfter?: string
  pageSize?: number
  cursor?: string
}) => apiRequest<Page<Job>>(withQuery('/api/v1/jobs', params))

export const listSavedJobs = (params: { q?: string; pageSize?: number; cursor?: string } = {}) =>
  apiRequest<Page<Job>>(withQuery('/api/v1/jobs/saved', params))

export const setJobSaved = (jobId: string, saved: boolean) =>
  apiRequest<{ jobId: string; saved: boolean; savedAt: string | null }>(
    `/api/v1/jobs/${encodeURIComponent(jobId)}/saved`,
    { method: 'PUT', body: JSON.stringify({ saved }) },
  )

export const getJob = (jobId: string) =>
  apiRequest<Job>(`/api/v1/jobs/${encodeURIComponent(jobId)}`)

export const getJobMatch = (jobId: string) =>
  apiRequest<JobMatch>(`/api/v1/jobs/${encodeURIComponent(jobId)}/match`)

export const listApplications = (params: {
  source?: string
  status?: string
  q?: string
  pageSize?: number
  cursor?: string
} = {}) => apiRequest<Page<Application>>(withQuery('/api/v1/applications', params))

export const getApplication = (applicationId: string) =>
  apiRequest<Application & { events: ActivityEvent[] }>(
    `/api/v1/applications/${encodeURIComponent(applicationId)}`,
  )

export const createPreparation = (jobId: string, resumeId: string) =>
  apiRequest<{ preparationId: string; status: string; statusUrl: string }>(
    '/api/v1/application-preparations',
    { method: 'POST', headers: { 'Idempotency-Key': crypto.randomUUID() }, body: JSON.stringify({ jobId, resumeId }) },
  )

export const getPreparation = (preparationId: string) =>
  apiRequest<ApplicationPreparation>(
    `/api/v1/application-preparations/${encodeURIComponent(preparationId)}`,
  )

export const updatePreparation = (
  preparationId: string,
  version: number,
  answers: ApplicationPreparation['answers'],
) => apiRequest<{ preparationId: string; version: number; status: string; updatedAt: string }>(
  `/api/v1/application-preparations/${encodeURIComponent(preparationId)}`,
  {
    method: 'PUT',
    headers: { 'If-Match': `"${version}"` },
    body: JSON.stringify({ answers }),
  },
)

export const approvePreparation = (preparationId: string, approvedVersion: number) =>
  apiRequest<{ approvalId: string; preparationId: string; approvedVersion: number; approvedAt: string; expiresAt: string }>(
    `/api/v1/application-preparations/${encodeURIComponent(preparationId)}/approval`,
    {
      method: 'POST',
      body: JSON.stringify({
        approvedVersion,
        confirmation: 'I reviewed the application and approve this version for submission.',
      }),
    },
  )

export const submitPreparation = (
  preparationId: string,
  approvalId: string,
  approvedVersion: number,
) => apiRequest<{ runId: string; status: string; statusUrl: string }>(
  `/api/v1/application-preparations/${encodeURIComponent(preparationId)}/submissions`,
  {
    method: 'POST',
    headers: { 'Idempotency-Key': crypto.randomUUID() },
    body: JSON.stringify({ approvalId, approvedVersion }),
  },
)

export const listAutomationRuns = (params: { status?: string; pageSize?: number; cursor?: string } = {}) =>
  apiRequest<Page<AutomationRun>>(withQuery('/api/v1/automation/runs', params))

export const getAutomationRun = (runId: string) =>
  apiRequest<AutomationRun>(`/api/v1/automation/runs/${encodeURIComponent(runId)}`)

export const cancelAutomationRun = (runId: string) =>
  apiRequest<{ runId: string; status: string; statusUrl: string }>(
    `/api/v1/automation/runs/${encodeURIComponent(runId)}/cancel`,
    { method: 'POST', headers: { 'Idempotency-Key': crypto.randomUUID() } },
  )

export const listActivity = (params: { category?: string; pageSize?: number; cursor?: string } = {}) =>
  apiRequest<Page<ActivityEvent>>(withQuery('/api/v1/activity', params))

export const getSettings = () =>
  apiRequest<AppearanceSettings>('/api/v1/settings')

export const updateSettings = (theme: AppearanceSettings['theme']) =>
  apiRequest<AppearanceSettings>('/api/v1/settings', {
    method: 'PUT',
    body: JSON.stringify({ theme }),
  })

export const getIntegrations = () =>
  apiRequest<{ integrations: Integration[] }>('/api/v1/integrations')

export const saveConnectionRequest = (value: ConnectionRequest) =>
  apiRequest<ConnectionRequest>('/api/v1/integrations/connection-request', {
    method: 'PUT',
    body: JSON.stringify(value),
  })

export type Notification = {
  notificationId: string
  type: string
  title: string
  message: string
  readAt: string | null
  createdAt: string
  resource?: { type: string; id: string }
}

export const listNotifications = (params: { unreadOnly?: boolean; pageSize?: number; cursor?: string } = {}) =>
  apiRequest<Page<Notification> & { unreadCount: number }>(
    withQuery('/api/v1/notifications', params),
  )

export const markNotificationRead = (notificationId: string) =>
  apiRequest<{ notificationId: string; readAt: string }>(
    `/api/v1/notifications/${encodeURIComponent(notificationId)}/read`,
    { method: 'POST' },
  )

export const markAllNotificationsRead = () =>
  apiRequest<{ updatedCount: number; readAt: string }>('/api/v1/notifications/read-all', {
    method: 'POST',
  })

export type NotificationPreferences = {
  inAppEnabled: boolean
  categories: Record<string, boolean>
  updatedAt?: string
}

export const getNotificationPreferences = () =>
  apiRequest<NotificationPreferences>('/api/v1/notification-preferences')

export const updateNotificationPreferences = (preferences: Omit<NotificationPreferences, 'updatedAt'>) =>
  apiRequest<NotificationPreferences>('/api/v1/notification-preferences', {
    method: 'PUT',
    body: JSON.stringify(preferences),
  })

export type AgentTask = {
  taskId: string
  conversationId: string
  title?: string
  status: string
  currentStep?: string
  message?: string
  results?: unknown[]
  createdAt?: string
  updatedAt?: string
}

export const getAgentCapabilities = () =>
  apiRequest<{ available: boolean; taskTypes: string[]; updatedAt: string }>('/api/v1/agent/capabilities')

export const createAgentTask = (instruction: string, conversationId?: string) =>
  apiRequest<{ taskId: string; conversationId: string; status: string; statusUrl: string }>(
    '/api/v1/agent/tasks',
    {
      method: 'POST',
      headers: { 'Idempotency-Key': crypto.randomUUID() },
      body: JSON.stringify({ instruction, conversationId: conversationId ?? null }),
    },
  )

export const getAgentTask = (taskId: string) =>
  apiRequest<AgentTask>(`/api/v1/agent/tasks/${encodeURIComponent(taskId)}`)

export const listAgentTasks = (params: { limit?: number; cursor?: string } = {}) =>
  apiRequest<Page<AgentTask>>(withQuery('/api/v1/agent/tasks', { limit: params.limit ?? 20, cursor: params.cursor }))

export const sendAgentMessage = (conversationId: string, message: string) =>
  apiRequest<{ taskId: string; conversationId: string; status: string; statusUrl: string }>(
    `/api/v1/agent/conversations/${encodeURIComponent(conversationId)}/messages`,
    { method: 'POST', body: JSON.stringify({ message }) },
  )
