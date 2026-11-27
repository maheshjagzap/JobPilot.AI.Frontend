import { startTransition, useCallback, useEffect, useRef, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react'
import { Award, BriefcaseBusiness, Code2, Plus, Save, Trash2, UserRound } from 'lucide-react'
import { z } from 'zod'
import { readStoredAuth } from '../api/auth'
import { getProfile, updateProfile, type CandidateProfile, type UpdateCandidateProfileRequest } from '../api/features'
import { useApiQuery } from '../api/useApiQuery'
import JobSearchPreferences from './JobSearchPreferences'

type Experience = {
  id: number
  apiId?: string
  title: string
  employer: string
  employmentType?: string | null
  location: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

type Education = {
  id: number
  apiId?: string
  institution: string
  degree: string
  field: string
  startYear: string
  endYear: string
  grade: string
  educationLevel?: string | null
  gradeType?: string | null
  description?: string | null
  apiStartDate?: string | null
  apiEndDate?: string | null
}

type Certification = {
  id: number
  apiId?: string
  name: string
  issuer: string
  issueDate: string
  expiryDate: string
  doesNotExpire?: boolean
  credentialId: string
  credentialUrl: string
}

type Project = {
  id: number
  apiId?: string
  name: string
  role: string
  startDate: string
  endDate: string
  technologies: string[]
  description: string
  projectUrl: string
  repositoryUrl?: string | null
  isFeatured?: boolean
}

type PreferredLocation = {
  id: number
  country: string
  cities: string[]
}

type PersonalDetails = {
  fullName: string
  preferredName: string
  email: string
  phone: string
  city: string
  country: string
  summary: string
}

type SkillDetails = {
  id: number
  apiId?: string
  name: string
  category: string
  evidence: string
  proficiencyLevel?: string | null
  experienceMonths?: number | null
  isPrimary?: boolean
}

type Preferences = {
  targetRoles: string[]
  salaryMin: string
  salaryMax: string
  salaryCurrency: string
  salaryPeriod: string
  workModes: string[]
}

type Relocation = {
  currentCountry: string
  willingness: string
  authorization: string
  preferredLocations: PreferredLocation[]
}

const experienceSchema = z.array(z.object({
  id: z.number(), apiId: z.string().optional(), title: z.string(), employer: z.string(),
  employmentType: z.string().nullable().optional(), location: z.string(),
  startDate: z.string(), endDate: z.string(), current: z.boolean(), description: z.string(),
}))
const educationSchema = z.array(z.object({
  id: z.number(), apiId: z.string().optional(), institution: z.string(), degree: z.string(),
  field: z.string(), startYear: z.string(), endYear: z.string(), grade: z.string(),
  educationLevel: z.string().nullable().optional(), gradeType: z.string().nullable().optional(),
  description: z.string().nullable().optional(), apiStartDate: z.string().nullable().optional(),
  apiEndDate: z.string().nullable().optional(),
}))
const certificationSchema = z.array(z.object({
  id: z.number(), apiId: z.string().optional(), name: z.string(), issuer: z.string(),
  issueDate: z.string(), expiryDate: z.string(), doesNotExpire: z.boolean().optional(),
  credentialId: z.string(), credentialUrl: z.string(),
}))
const projectSchema = z.array(z.object({
  id: z.number(), apiId: z.string().optional(), name: z.string(), role: z.string(),
  startDate: z.string(), endDate: z.string(), technologies: z.array(z.string()),
  description: z.string(), projectUrl: z.string(), repositoryUrl: z.string().nullable().optional(),
  isFeatured: z.boolean().optional(),
}))
const personalSchema = z.object({
  fullName: z.string(), preferredName: z.string(), email: z.string(), phone: z.string(),
  city: z.string(), country: z.string(), summary: z.string(),
})
const skillSchema = z.array(z.object({
  id: z.number(), apiId: z.string().optional(), name: z.string(), category: z.string(),
  evidence: z.string(), proficiencyLevel: z.string().nullable().optional(),
  experienceMonths: z.number().nullable().optional(), isPrimary: z.boolean().optional(),
}))
const preferencesSchema = z.object({
  targetRoles: z.array(z.string()), salaryMin: z.string(), salaryMax: z.string(),
  salaryCurrency: z.string(), salaryPeriod: z.string(), workModes: z.array(z.string()),
})
const relocationSchema = z.object({
  currentCountry: z.string(), willingness: z.string(), authorization: z.string(),
  preferredLocations: z.array(z.object({ id: z.number(), country: z.string(), cities: z.array(z.string()) })),
})

function emptyCandidateProfile(): CandidateProfile {
  const owner = readStoredAuth()?.owner
  return {
    profileId: '',
    eTag: '',
    personal: {
      preferredName: null,
      firstName: owner?.firstName ?? '',
      lastName: owner?.lastName ?? '',
      email: owner?.email ?? '',
      phoneNumber: null,
      professionalTitle: null,
      careerSummary: null,
      currentLocation: null,
      currentCountryCode: null,
      linkedInUrl: null,
      gitHubUrl: null,
      portfolioUrl: null,
      isOpenToWork: true,
      noticePeriodDays: null,
      willingToRelocate: null,
      workAuthorization: null,
    },
    experience: [],
    education: [],
    certifications: [],
    skills: [],
    projects: [],
    updatedAt: '',
  }
}

const COUNTRY_SUGGESTIONS = [
  'Australia',
  'Canada',
  'Germany',
  'India',
  'Ireland',
  'Netherlands',
  'Singapore',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
]

const POPULAR_CITIES: Record<string, string[]> = {
  australia: ['Melbourne', 'Perth', 'Sydney'],
  canada: ['Calgary', 'Montreal', 'Toronto', 'Vancouver'],
  germany: ['Berlin', 'Frankfurt', 'Hamburg', 'Munich'],
  india: ['Bengaluru', 'Chennai', 'Delhi', 'Hyderabad', 'Mumbai', 'Pune'],
  ireland: ['Cork', 'Dublin', 'Galway'],
  netherlands: ['Amsterdam', 'Eindhoven', 'Rotterdam', 'Utrecht'],
  singapore: ['Singapore'],
  'united arab emirates': ['Abu Dhabi', 'Dubai'],
  'united kingdom': ['Birmingham', 'London', 'Manchester'],
  'united states': ['Austin', 'Boston', 'New York', 'Seattle', 'San Francisco'],
}

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}

function ProfileNotice({ authenticated, error }: { authenticated: boolean; error: string }) {
  return (
    <div className="notice" role={error ? 'alert' : undefined}>
      <UserRound size={18}/>
      <span>{error || (authenticated
        ? 'Personal, experience, projects, education, certifications, skills, and job-search preferences sync to your account. Relocation remains a browser-only draft. Name, email, and phone are read-only.'
        : 'Sign in to sync supported profile sections; without an account session, drafts are saved only in this browser.')}</span>
    </div>
  )
}

function parseRemoteRows<T>(value: unknown, schema: z.ZodType<T[]>) {
  if (!Array.isArray(value)) return schema.parse([])
  const rows = value.map((item, index) => {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) return item
    const row = item as Record<string, unknown>
    return { ...row, id: typeof row.id === 'number' ? row.id : index + 1 }
  })
  return schema.parse(rows)
}

function dateForYear(year: string, originalDate?: string | null) {
  if (!year) return null
  if (originalDate?.slice(0, 4) === year) return originalDate
  return /^\d{4}$/.test(year) ? `${year}-01-01` : null
}

function mapCandidateProfile(profile: CandidateProfile) {
  const personal = personalSchema.parse({
    fullName: [profile.personal.firstName, profile.personal.lastName].filter(Boolean).join(' '),
    preferredName: profile.personal.preferredName ?? '',
    email: profile.personal.email,
    phone: profile.personal.phoneNumber ?? '',
    city: profile.personal.currentLocation ?? '',
    country: profile.personal.currentCountryCode ?? '',
    summary: profile.personal.careerSummary ?? '',
  })
  const experiences = parseRemoteRows((profile.experience ?? []).map((entry) => ({
    apiId: entry.experienceId,
    title: entry.jobTitle,
    employer: entry.companyName,
    employmentType: entry.employmentType,
    location: entry.location ?? '',
    startDate: entry.startDate,
    endDate: entry.endDate ?? '',
    current: entry.isCurrentlyWorking,
    description: entry.description ?? '',
  })), experienceSchema)
  const educations = parseRemoteRows((profile.education ?? []).map((entry) => ({
    apiId: entry.educationId,
    institution: entry.institutionName,
    degree: entry.degree,
    field: entry.specialization ?? '',
    startYear: entry.startDate?.slice(0, 4) ?? '',
    endYear: entry.endDate?.slice(0, 4) ?? '',
    grade: entry.gradeValue ?? '',
    educationLevel: entry.educationLevel,
    gradeType: entry.gradeType,
    description: entry.description,
    apiStartDate: entry.startDate,
    apiEndDate: entry.endDate,
  })), educationSchema)
  const certifications = parseRemoteRows((profile.certifications ?? []).map((entry) => ({
    apiId: entry.certificationId,
    name: entry.certificationName,
    issuer: entry.issuingOrganization,
    issueDate: entry.issueDate ?? '',
    expiryDate: entry.expiryDate ?? '',
    doesNotExpire: entry.doesNotExpire,
    credentialId: entry.credentialId ?? '',
    credentialUrl: entry.credentialUrl ?? '',
  })), certificationSchema)
  const skills = parseRemoteRows((profile.skills ?? []).map((entry) => ({
    apiId: entry.userSkillId,
    name: entry.skillName,
    category: entry.skillCategory ?? '',
    evidence: entry.evidence ?? '',
    proficiencyLevel: entry.proficiencyLevel,
    experienceMonths: entry.experienceMonths,
    isPrimary: entry.isPrimary,
  })), skillSchema)
  const projects = parseRemoteRows((profile.projects ?? []).map((entry) => ({
    apiId: entry.projectId,
    name: entry.projectName,
    role: entry.role ?? '',
    startDate: entry.startDate ?? '',
    endDate: entry.endDate ?? '',
    technologies: entry.technologies ?? [],
    description: entry.description ?? '',
    projectUrl: entry.projectUrl ?? '',
    repositoryUrl: entry.repositoryUrl,
    isFeatured: entry.isFeatured,
  })), projectSchema)

  return { personal, experiences, educations, certifications, skills, projects }
}

function buildProfileUpdate(
  profile: CandidateProfile,
  personal: PersonalDetails,
  experiences: Experience[],
  educations: Education[],
  certifications: Certification[],
  skills: SkillDetails[],
  projects: Project[],
): UpdateCandidateProfileRequest {
  return {
    personal: {
      preferredName: personal.preferredName || null,
      professionalTitle: profile.personal.professionalTitle,
      careerSummary: personal.summary || null,
      currentLocation: personal.city || null,
      currentCountryCode: personal.country || null,
      linkedInUrl: profile.personal.linkedInUrl,
      gitHubUrl: profile.personal.gitHubUrl,
      portfolioUrl: profile.personal.portfolioUrl,
      isOpenToWork: profile.personal.isOpenToWork,
      noticePeriodDays: profile.personal.noticePeriodDays,
      willingToRelocate: profile.personal.willingToRelocate,
      workAuthorization: profile.personal.workAuthorization,
    },
    experience: experiences.map((entry, displayOrder) => ({
      experienceId: entry.apiId ?? null,
      companyName: entry.employer,
      jobTitle: entry.title,
      employmentType: entry.employmentType ?? null,
      location: entry.location || null,
      startDate: entry.startDate,
      endDate: entry.current ? null : entry.endDate || null,
      isCurrentlyWorking: entry.current,
      description: entry.description || null,
      displayOrder,
    })),
    education: educations.map((entry, displayOrder) => ({
      educationId: entry.apiId ?? null,
      institutionName: entry.institution,
      degree: entry.degree,
      specialization: entry.field || null,
      educationLevel: entry.educationLevel ?? null,
      startDate: dateForYear(entry.startYear, entry.apiStartDate),
      endDate: dateForYear(entry.endYear, entry.apiEndDate),
      gradeType: entry.gradeType ?? null,
      gradeValue: entry.grade || null,
      description: entry.description ?? null,
      displayOrder,
    })),
    certifications: certifications.map((entry, displayOrder) => ({
      certificationId: entry.apiId ?? null,
      certificationName: entry.name,
      issuingOrganization: entry.issuer,
      issueDate: entry.issueDate || null,
      expiryDate: entry.expiryDate || null,
      doesNotExpire: entry.expiryDate ? false : entry.doesNotExpire ?? false,
      credentialId: entry.credentialId || null,
      credentialUrl: entry.credentialUrl || null,
      displayOrder,
    })),
    skills: skills.map((entry) => ({
      userSkillId: entry.apiId ?? null,
      skillName: entry.name,
      skillCategory: entry.category || null,
      proficiencyLevel: entry.proficiencyLevel ?? null,
      experienceMonths: entry.experienceMonths ?? null,
      evidence: entry.evidence || null,
      isPrimary: entry.isPrimary ?? false,
    })),
    projects: projects.map((entry, displayOrder) => ({
      projectId: entry.apiId ?? null,
      projectName: entry.name,
      role: entry.role || null,
      description: entry.description || null,
      projectUrl: entry.projectUrl || null,
      repositoryUrl: entry.repositoryUrl ?? null,
      startDate: entry.startDate || null,
      endDate: entry.endDate || null,
      isFeatured: entry.isFeatured ?? false,
      displayOrder,
      technologies: entry.technologies,
    })),
  }
}

function useBrowserDraft<T>(key: string, initialValue: T, schema: z.ZodType<T>) {
  const [initial] = useState(() => {
    let raw: string | null
    try {
      raw = localStorage.getItem(key)
    } catch {
      return { value: initialValue, status: 'Browser storage is unavailable. Changes cannot be saved here.' }
    }
    if (raw === null) return { value: initialValue, status: 'No saved draft in this browser.' }
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      return { value: initialValue, status: 'The saved draft could not be read. Saving this section will replace it.' }
    }
    const result = schema.safeParse(parsed)
    return result.success
      ? { value: result.data, status: 'Draft loaded from this browser. It is not synced to an account.' }
      : { value: initialValue, status: 'The saved draft has an invalid format. Saving this section will replace it.' }
  })
  const [value, setValue] = useState<T>(initial.value)
  const [status, setStatus] = useState(initial.status)

  const updateValue = useCallback<Dispatch<SetStateAction<T>>>((nextValue) => {
    setValue(nextValue)
    setStatus('Unsaved changes. Save this section to keep the draft.')
  }, [])

  const save = useCallback(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      setStatus('Saved in this browser only. Not synced to an account.')
    } catch {
      setStatus('Could not save to browser storage. Your changes remain unsaved.')
    }
  }, [key, value])

  return { value, setValue: updateValue, status, setStatus, save }
}

export default function Profile() {
  const [tab, setTab] = useState('Personal')
  const authenticated = Boolean(readStoredAuth())
  const profileQuery = useApiQuery('candidate-profile', getProfile, authenticated)
  const [profileETag, setProfileETag] = useState('')
  const [remoteProfile, setRemoteProfile] = useState<CandidateProfile>()
  const [profileLoadError, setProfileLoadError] = useState('')
  const experienceDraft = useBrowserDraft<Experience[]>('jobpilot-profile-experience', [], experienceSchema)
  const educationDraft = useBrowserDraft<Education[]>('jobpilot-profile-education', [], educationSchema)
  const certificationDraft = useBrowserDraft<Certification[]>('jobpilot-profile-certifications', [], certificationSchema)
  const projectDraft = useBrowserDraft<Project[]>('jobpilot-profile-projects', [], projectSchema)
  const personalDraft = useBrowserDraft<PersonalDetails>('jobpilot-profile-personal', {
    fullName: '', preferredName: '', email: '', phone: '', city: '', country: '', summary: '',
  }, personalSchema)
  const skillDraft = useBrowserDraft<SkillDetails[]>('jobpilot-profile-skills', [], skillSchema)
  const preferencesDraft = useBrowserDraft<Preferences>('jobpilot-profile-preferences', {
    targetRoles: [], salaryMin: '', salaryMax: '', salaryCurrency: 'INR', salaryPeriod: 'Yearly', workModes: [],
  }, preferencesSchema)
  const relocationDraft = useBrowserDraft<Relocation>('jobpilot-profile-relocation', {
    currentCountry: '', willingness: 'Not specified', authorization: '', preferredLocations: [],
  }, relocationSchema)
  const experiences = experienceDraft.value
  const setExperiences = experienceDraft.setValue
  const educations = educationDraft.value
  const setEducations = educationDraft.setValue
  const certifications = certificationDraft.value
  const setCertifications = certificationDraft.setValue
  const projects = projectDraft.value
  const setProjects = projectDraft.setValue
  const personal = personalDraft.value
  const setPersonal = personalDraft.setValue
  const skills = skillDraft.value
  const setSkills = skillDraft.setValue
  const preferences = preferencesDraft.value
  const setPreferences = preferencesDraft.setValue
  const relocation = relocationDraft.value
  const setRelocation = relocationDraft.setValue
  const setPersonalStatus = personalDraft.setStatus
  const setExperienceStatus = experienceDraft.setStatus
  const setProjectStatus = projectDraft.setStatus
  const setEducationStatus = educationDraft.setStatus
  const setCertificationStatus = certificationDraft.setStatus
  const setSkillStatus = skillDraft.setStatus
  const setRelocationStatus = relocationDraft.setStatus
  const [roleInput, setRoleInput] = useState('')
  const [skillName, setSkillName] = useState('')
  const [skillCategory, setSkillCategory] = useState('Backend')
  const [skillEvidence, setSkillEvidence] = useState('')
  const preferredLocations = relocation.preferredLocations
  const [countryInput, setCountryInput] = useState('')
  const [citySelections, setCitySelections] = useState<Record<number, string>>({})
  const [customCityInputs, setCustomCityInputs] = useState<Record<number, string>>({})
  const nextId = useRef(0)
  const tabs = ['Personal', 'Experience', 'Projects', 'Education', 'Certifications', 'Skills', 'Preferences', 'Relocation']

  const applyRemoteProfile = useCallback((profile: CandidateProfile) => {
    const mapped = mapCandidateProfile(profile)
    startTransition(() => {
      setRemoteProfile(profile)
      setProfileETag(profile.eTag)
      setPersonal(mapped.personal)
      setExperiences(mapped.experiences)
      setProjects(mapped.projects)
      setEducations(mapped.educations)
      setCertifications(mapped.certifications)
      setSkills(mapped.skills)
      setPersonalStatus('Loaded from your account.')
      setExperienceStatus('Loaded from your account.')
      setEducationStatus('Loaded from your account.')
      setCertificationStatus('Loaded from your account.')
      setSkillStatus('Loaded from your account.')
      setProjectStatus('Loaded from your account.')
      setRelocationStatus('The profile API does not include relocation; this remains a browser draft.')
      setProfileLoadError('')
    })
  }, [
    setPersonal,
    setExperiences,
    setProjects,
    setEducations,
    setCertifications,
    setSkills,
    setPersonalStatus,
    setExperienceStatus,
    setProjectStatus,
    setEducationStatus,
    setCertificationStatus,
    setSkillStatus,
    setRelocationStatus,
  ])

  useEffect(() => {
    if (profileQuery.loading || profileQuery.error) return
    if (profileQuery.data === null) {
      applyRemoteProfile(emptyCandidateProfile())
      return
    }
    if (!profileQuery.data) return
    try {
      applyRemoteProfile(profileQuery.data)
    } catch (reason) {
      startTransition(() => setProfileLoadError(reason instanceof Error ? reason.message : 'The profile response could not be loaded.'))
    }
  }, [profileQuery.data, profileQuery.error, profileQuery.loading, applyRemoteProfile])

  async function saveSection(
    draft: { setStatus: (status: string) => void; save: () => void },
    syncWithAccount = true,
  ) {
    if (!authenticated || !syncWithAccount) {
      draft.save()
      if (authenticated && !syncWithAccount) {
        draft.setStatus('Saved in this browser only. This section is not in the profile API.')
      }
      return
    }
    if (profileQuery.loading) {
      draft.setStatus('Profile data is still loading. Wait before saving.')
      return
    }
    if (profileQuery.error) {
      draft.setStatus('Profile data could not be loaded. Reload before saving.')
      return
    }
    if (!remoteProfile) {
      draft.setStatus('Profile data is not loaded. Reload before saving.')
      return
    }
    draft.setStatus('Saving to your account...')
    try {
      await updateProfile(
        buildProfileUpdate(
          remoteProfile,
          personal,
          experiences,
          educations,
          certifications,
          skills,
          projects,
        ),
        profileETag || undefined,
      )
    } catch (reason) {
      draft.setStatus(reason instanceof Error ? reason.message : 'Could not save your profile.')
      return
    }

    try {
      const updatedProfile = await getProfile()
      if (!updatedProfile) throw new Error('The saved profile could not be found.')
      applyRemoteProfile(updatedProfile)
      draft.setStatus('Saved to your account.')
    } catch (reason) {
      setProfileETag('')
      setProfileLoadError('Your changes were sent, but the updated profile could not be reloaded. Reload before saving again.')
      draft.setStatus(reason instanceof Error ? `Saved, but refresh failed: ${reason.message}` : 'Saved, but the updated profile could not be reloaded.')
    }
  }

  function createId() {
    nextId.current += 1
    return nextId.current
  }

  function addExperience(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setExperiences((entries) => [...entries, {
      id: createId(),
      title: value(data, 'title'),
      employer: value(data, 'employer'),
      location: value(data, 'location'),
      startDate: value(data, 'startDate'),
      endDate: value(data, 'endDate'),
      current: data.get('current') === 'on',
      description: value(data, 'description'),
    }])
    form.reset()
  }

  function addEducation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setEducations((entries) => [...entries, {
      id: createId(),
      institution: value(data, 'institution'),
      degree: value(data, 'degree'),
      field: value(data, 'field'),
      startYear: value(data, 'startYear'),
      endYear: value(data, 'endYear'),
      grade: value(data, 'grade'),
    }])
    form.reset()
  }

  function addProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setProjects((entries) => [...entries, {
      id: createId(),
      name: value(data, 'name'),
      role: value(data, 'role'),
      startDate: value(data, 'startDate'),
      endDate: value(data, 'endDate'),
      technologies: value(data, 'technologies').split(',').map((technology) => technology.trim()).filter(Boolean),
      description: value(data, 'description'),
      projectUrl: value(data, 'projectUrl'),
    }])
    form.reset()
  }

  function addCertification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setCertifications((entries) => [...entries, {
      id: createId(),
      name: value(data, 'name'),
      issuer: value(data, 'issuer'),
      issueDate: value(data, 'issueDate'),
      expiryDate: value(data, 'expiryDate'),
      credentialId: value(data, 'credentialId'),
      credentialUrl: value(data, 'credentialUrl'),
    }])
    form.reset()
  }

  function addTargetRole() {
    const role = roleInput.trim()
    if (!role || preferences.targetRoles.some((item) => item.toLowerCase() === role.toLowerCase())) return
    setPreferences((current) => ({ ...current, targetRoles: [...current.targetRoles, role] }))
    setRoleInput('')
  }

  function addSkill(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = skillName.trim()
    if (!name || skills.some((skill) => skill.name.toLowerCase() === name.toLowerCase())) return
    setSkills((items) => [...items, {
      id: createId(),
      name,
      category: skillCategory,
      evidence: skillEvidence.trim(),
    }])
    setSkillName('')
    setSkillCategory('Backend')
    setSkillEvidence('')
  }

  function toggleWorkMode(mode: string) {
    setPreferences((current) => {
      const selected = current.workModes
      if (mode === 'Flexible / Any') {
        return { ...current, workModes: selected.includes(mode) ? [] : [mode] }
      }
      const withoutFlexible = selected.filter((item) => item !== 'Flexible / Any')
      const workModes = withoutFlexible.includes(mode)
        ? withoutFlexible.filter((item) => item !== mode)
        : [...withoutFlexible, mode]
      return { ...current, workModes }
    })
  }

  function addPreferredCountry() {
    const country = countryInput.trim()
    if (!country || preferredLocations.some((item) => item.country.toLowerCase() === country.toLowerCase())) return
    setRelocation((current) => ({
      ...current,
      preferredLocations: [...current.preferredLocations, { id: createId(), country, cities: [] }],
    }))
    setCountryInput('')
  }

  function addCity(locationId: number, cityValue: string) {
    const city = cityValue.trim()
    if (!city) return
    setRelocation((current) => ({
      ...current,
      preferredLocations: current.preferredLocations.map((item) => (
      item.id === locationId && !item.cities.some((existing) => existing.toLowerCase() === city.toLowerCase())
        ? { ...item, cities: [...item.cities, city] }
        : item
      )),
    }))
  }

  const salaryRangeError =
    (preferences.salaryMin && Number(preferences.salaryMin) < 0) ||
    (preferences.salaryMax && Number(preferences.salaryMax) < 0)
      ? 'Salary values cannot be negative.'
      : preferences.salaryMin && preferences.salaryMax && Number(preferences.salaryMin) > Number(preferences.salaryMax)
        ? 'Minimum salary must not exceed maximum salary.'
        : ''

  return (
    <div>
      <div className="page-header">
        <div><h1>Candidate Profile</h1><p>Your verified source of truth</p></div>
      </div>
      <ProfileNotice authenticated={authenticated} error={profileLoadError || profileQuery.error} />
      {authenticated && profileQuery.loading && <div className="notice" role="status">Loading your profile...</div>}
      <div className="card">
        <div className="tabs" role="tablist" aria-label="Profile sections">
          {tabs.map((item) => (
            <button
              aria-selected={tab === item}
              className={`tab ${tab === item ? 'active' : ''}`}
              key={item}
              onClick={() => setTab(item)}
              role="tab"
              type="button"
            >{item}</button>
          ))}
        </div>
        <div className="card-body">
          {tab === 'Personal' && <form className="form-grid" onSubmit={(event) => { event.preventDefault(); void saveSection(personalDraft) }}>
            {authenticated && <p className="section-description full">Name, email, and phone are read-only because the profile update API does not accept those fields.</p>}
            <div className="field"><label htmlFor="name">Full legal name *</label><input id="name" required readOnly={authenticated} value={personal.fullName} onChange={(event) => setPersonal((current) => ({ ...current, fullName: event.target.value }))} placeholder="Your full name"/></div>
            <div className="field"><label htmlFor="preferred">Preferred name</label><input id="preferred" value={personal.preferredName} onChange={(event) => setPersonal((current) => ({ ...current, preferredName: event.target.value }))} placeholder="Optional"/></div>
            <div className="field"><label htmlFor="email">Email *</label><input id="email" type="email" required readOnly={authenticated} value={personal.email} onChange={(event) => setPersonal((current) => ({ ...current, email: event.target.value }))} placeholder="you@example.com"/></div>
            <div className="field"><label htmlFor="phone">Phone</label><input id="phone" readOnly={authenticated} value={personal.phone} onChange={(event) => setPersonal((current) => ({ ...current, phone: event.target.value }))} placeholder="+91..."/></div>
            <div className="field"><label htmlFor="city">Current city</label><input id="city" value={personal.city} onChange={(event) => setPersonal((current) => ({ ...current, city: event.target.value }))} placeholder="City"/></div>
            <div className="field"><label htmlFor="country">Country</label><input id="country" value={personal.country} onChange={(event) => setPersonal((current) => ({ ...current, country: event.target.value }))} placeholder="Country"/></div>
            <div className="field full"><label htmlFor="summary">Professional summary</label><textarea id="summary" value={personal.summary} onChange={(event) => setPersonal((current) => ({ ...current, summary: event.target.value }))} placeholder="Summarize your experience without exaggeration"/></div>
            <SectionSave status={personalDraft.status} onSave={() => { void saveSection(personalDraft) }} submit/>
          </form>}

          {tab === 'Experience' && <>
            <form className="form-grid repeatable-form" onSubmit={addExperience}>
              <div className="field"><label htmlFor="experience-title">Job title *</label><input id="experience-title" name="title" required placeholder="e.g. Software Engineer"/></div>
              <div className="field"><label htmlFor="experience-employer">Employer *</label><input id="experience-employer" name="employer" required placeholder="Company name"/></div>
              <div className="field"><label htmlFor="experience-location">Location</label><input id="experience-location" name="location" placeholder="City, country"/></div>
              <div className="field"><label htmlFor="experience-start">Start date *</label><input id="experience-start" name="startDate" type="date" required/></div>
              <div className="field"><label htmlFor="experience-end">End date</label><input id="experience-end" name="endDate" type="date"/></div>
              <label className="current-role"><input name="current" type="checkbox"/> I currently work here</label>
              <div className="field full"><label htmlFor="experience-description">Responsibilities and achievements</label><textarea id="experience-description" name="description" placeholder="Describe verified responsibilities and achievements"/></div>
              <div className="form-action full"><button className="secondary-button" type="submit"><Plus size={17}/>Add experience</button></div>
            </form>
            <EntryList title="Experience added" empty="Your experience entries will appear here after you add them." sourceLabel={authenticated ? 'Account records' : 'Local drafts'}>
              {experiences.map((entry) => (
                <article className="profile-entry" key={entry.id}>
                  <div className="profile-entry-icon"><BriefcaseBusiness size={18}/></div>
                  <div className="profile-entry-copy">
                    <strong>{entry.title}</strong><span>{entry.employer}{entry.location ? ` · ${entry.location}` : ''}</span>
                    <small>{entry.startDate}{entry.current ? ' · Present' : entry.endDate ? ` — ${entry.endDate}` : ''}</small>
                    {entry.description && <p>{entry.description}</p>}
                  </div>
                  <button className="entry-remove" type="button" aria-label={`Remove ${entry.title}`} onClick={() => setExperiences((items) => items.filter((item) => item.id !== entry.id))}><Trash2 size={16}/></button>
                </article>
              ))}
            </EntryList>
            <SectionSave status={experienceDraft.status} onSave={() => { void saveSection(experienceDraft) }}/>
          </>}

          {tab === 'Education' && <>
            <form className="form-grid repeatable-form" onSubmit={addEducation}>
              <div className="field"><label htmlFor="education-institution">Institution *</label><input id="education-institution" name="institution" required placeholder="School or university"/></div>
              <div className="field"><label htmlFor="education-degree">Degree *</label><input id="education-degree" name="degree" required placeholder="Degree or qualification"/></div>
              <div className="field"><label htmlFor="education-field">Field of study *</label><input id="education-field" name="field" required placeholder="Major or subject"/></div>
              <div className="field"><label htmlFor="education-start">Start year</label><input id="education-start" name="startYear" type="number" min="1900" max="2100" placeholder="2020"/></div>
              <div className="field"><label htmlFor="education-end">End year</label><input id="education-end" name="endYear" type="number" min="1900" max="2100" placeholder="2024"/></div>
              <div className="field"><label htmlFor="education-grade">Grade (optional)</label><input id="education-grade" name="grade" placeholder="Add only if you choose"/></div>
              <div className="form-action full"><button className="secondary-button" type="submit"><Plus size={17}/>Add education</button></div>
            </form>
            <EntryList title="Education added" empty="Your education entries will appear here after you add them." sourceLabel={authenticated ? 'Account records' : 'Local drafts'}>
              {educations.map((entry) => (
                <article className="profile-entry" key={entry.id}>
                  <div className="profile-entry-icon"><UserRound size={18}/></div>
                  <div className="profile-entry-copy">
                    <strong>{entry.degree} · {entry.field}</strong><span>{entry.institution}</span>
                    <small>{[entry.startYear, entry.endYear].filter(Boolean).join(' — ')}</small>
                    {entry.grade && <small>Grade: {entry.grade}</small>}
                  </div>
                  <button className="entry-remove" type="button" aria-label={`Remove ${entry.degree}`} onClick={() => setEducations((items) => items.filter((item) => item.id !== entry.id))}><Trash2 size={16}/></button>
                </article>
              ))}
            </EntryList>
            <SectionSave status={educationDraft.status} onSave={() => { void saveSection(educationDraft) }}/>
          </>}

          {tab === 'Projects' && <>
            <form className="form-grid repeatable-form" onSubmit={addProject}>
              <div className="field"><label htmlFor="project-name">Project name *</label><input id="project-name" name="name" required placeholder="Project title"/></div>
              <div className="field"><label htmlFor="project-role">Your role</label><input id="project-role" name="role" placeholder="e.g. Developer"/></div>
              <div className="field"><label htmlFor="project-start">Start date</label><input id="project-start" name="startDate" type="date"/></div>
              <div className="field"><label htmlFor="project-end">End date</label><input id="project-end" name="endDate" type="date"/></div>
              <div className="field full"><label htmlFor="project-technologies">Technologies used</label><input id="project-technologies" name="technologies" placeholder="Comma-separated, e.g. C#, React, SQL Server"/></div>
              <div className="field full"><label htmlFor="project-description">Project description</label><textarea id="project-description" name="description" placeholder="What did the project do, and what did you contribute?"/></div>
              <div className="field full"><label htmlFor="project-url">Project or repository link</label><input id="project-url" name="projectUrl" type="url" placeholder="https://..."/></div>
              <div className="form-action full"><button className="secondary-button" type="submit"><Plus size={17}/>Add project</button></div>
            </form>
            <EntryList title="Projects added" empty="Your projects will appear here after you add them." sourceLabel={authenticated ? 'Account records' : 'Local drafts'}>
              {projects.map((project) => (
                <article className="profile-entry" key={project.id}>
                  <div className="profile-entry-icon"><Code2 size={18}/></div>
                  <div className="profile-entry-copy">
                    <strong>{project.name}</strong>
                    {project.role && <span>{project.role}</span>}
                    {(project.startDate || project.endDate) && <small>{[project.startDate, project.endDate].filter(Boolean).join(' — ')}</small>}
                    {project.technologies.length > 0 && <small>Technologies: {project.technologies.join(', ')}</small>}
                    {project.description && <p>{project.description}</p>}
                    {project.projectUrl && <a href={project.projectUrl} target="_blank" rel="noreferrer">View project</a>}
                  </div>
                  <button className="entry-remove" type="button" aria-label={`Remove ${project.name}`} onClick={() => setProjects((items) => items.filter((item) => item.id !== project.id))}><Trash2 size={16}/></button>
                </article>
              ))}
            </EntryList>
            <SectionSave status={projectDraft.status} onSave={() => { void saveSection(projectDraft) }}/>
          </>}

          {tab === 'Certifications' && <>
            <form className="form-grid repeatable-form" onSubmit={addCertification}>
              <div className="field"><label htmlFor="certification-name">Certification name *</label><input id="certification-name" name="name" required placeholder="Certification title"/></div>
              <div className="field"><label htmlFor="certification-issuer">Issuing organization *</label><input id="certification-issuer" name="issuer" required placeholder="Organization name"/></div>
              <div className="field"><label htmlFor="certification-issued">Issue date</label><input id="certification-issued" name="issueDate" type="date"/></div>
              <div className="field"><label htmlFor="certification-expiry">Expiry date</label><input id="certification-expiry" name="expiryDate" type="date"/></div>
              <div className="field"><label htmlFor="certification-id">Credential ID</label><input id="certification-id" name="credentialId" placeholder="Optional"/></div>
              <div className="field"><label htmlFor="certification-url">Credential URL</label><input id="certification-url" name="credentialUrl" type="url" placeholder="https://..."/></div>
              <div className="form-action full"><button className="secondary-button" type="submit"><Plus size={17}/>Add certification</button></div>
            </form>
            <EntryList title="Certifications added" empty="Your certifications will appear here after you add them." sourceLabel={authenticated ? 'Account records' : 'Local drafts'}>
              {certifications.map((entry) => (
                <article className="profile-entry" key={entry.id}>
                  <div className="profile-entry-icon"><Award size={18}/></div>
                  <div className="profile-entry-copy">
                    <strong>{entry.name}</strong><span>{entry.issuer}</span>
                    <small>{entry.issueDate ? `Issued ${entry.issueDate}` : ''}{entry.expiryDate ? ` · Expires ${entry.expiryDate}` : ''}</small>
                    {entry.credentialId && <small>Credential ID: {entry.credentialId}</small>}
                    {entry.credentialUrl && <a href={entry.credentialUrl} target="_blank" rel="noreferrer">View credential</a>}
                  </div>
                  <button className="entry-remove" type="button" aria-label={`Remove ${entry.name}`} onClick={() => setCertifications((items) => items.filter((item) => item.id !== entry.id))}><Trash2 size={16}/></button>
                </article>
              ))}
            </EntryList>
            <SectionSave status={certificationDraft.status} onSave={() => { void saveSection(certificationDraft) }}/>
          </>}

          {tab === 'Skills' && <>
            <form className="form-grid repeatable-form" onSubmit={addSkill}>
              <div className="field"><label htmlFor="skill-name">Skill name *</label><input id="skill-name" required value={skillName} onChange={(event) => setSkillName(event.target.value)} placeholder="e.g. ASP.NET Core"/></div>
              <div className="field"><label htmlFor="skill-category">Category</label><select id="skill-category" value={skillCategory} onChange={(event) => setSkillCategory(event.target.value)}><option>Backend</option><option>Frontend</option><option>Cloud</option><option>Tools</option></select></div>
              <div className="field full"><label htmlFor="skill-evidence">Supporting experience</label><textarea value={skillEvidence} onChange={(event) => setSkillEvidence(event.target.value)} id="skill-evidence" placeholder="Describe the evidence for this skill"/></div>
              <div className="form-action full"><button className="secondary-button" type="submit"><Plus size={17}/>Add skill</button></div>
            </form>
            <EntryList title="Skills added" empty="Your skills will appear here after you add them." sourceLabel={authenticated ? 'Account records' : 'Local drafts'}>
              {skills.map((skill) => (
                <article className="profile-entry" key={skill.id}>
                  <div className="profile-entry-icon"><Award size={18}/></div>
                  <div className="profile-entry-copy"><strong>{skill.name}</strong><span>{skill.category}</span>{skill.evidence && <p>{skill.evidence}</p>}</div>
                  <button className="entry-remove" type="button" aria-label={`Remove ${skill.name}`} onClick={() => setSkills((items) => items.filter((item) => item.id !== skill.id))}><Trash2 size={16}/></button>
                </article>
              ))}
            </EntryList>
            <SectionSave status={skillDraft.status} onSave={() => { void saveSection(skillDraft) }}/>
          </>}
          {tab === 'Preferences' && (authenticated ? <JobSearchPreferences /> : <div className="preferences-content">
            <section className="preference-section">
              <div className="profile-entry-heading"><h2>Target roles</h2><span className="badge">Multiple</span></div>
              <p className="section-description">Sign in to manage account-synced job-search preferences. These signed-out preferences stay in this browser.</p>
              <div className="inline-add">
                <label className="sr-only" htmlFor="target-role-input">Target role</label>
                <input
                  id="target-role-input"
                  value={roleInput}
                  onChange={(event) => setRoleInput(event.target.value)}
                  onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addTargetRole() } }}
                  placeholder="e.g. .NET Developer"
                />
                <button className="secondary-button" onClick={addTargetRole} type="button" disabled={!roleInput.trim()}><Plus size={16}/>Add role</button>
              </div>
              {preferences.targetRoles.length > 0 ? <ul className="draft-chip-list" aria-label="Added target roles">
                {preferences.targetRoles.map((role) => <li className="draft-chip" key={role}><span>{role}</span><button type="button" aria-label={`Remove ${role}`} onClick={() => setPreferences((current) => ({ ...current, targetRoles: current.targetRoles.filter((item) => item !== role) }))}>×</button></li>)}
              </ul> : <p className="profile-entry-empty">No target roles added yet.</p>}
            </section>

            <section className="preference-section">
              <div className="profile-entry-heading"><h2>Salary range</h2></div>
              <div className="form-grid">
                <div className="field"><label htmlFor="salary-min">Minimum salary</label><input id="salary-min" type="number" min="0" value={preferences.salaryMin} onChange={(event) => setPreferences((current) => ({ ...current, salaryMin: event.target.value }))} placeholder="Minimum"/></div>
                <div className="field"><label htmlFor="salary-max">Maximum salary</label><input id="salary-max" type="number" min="0" value={preferences.salaryMax} onChange={(event) => setPreferences((current) => ({ ...current, salaryMax: event.target.value }))} placeholder="Maximum"/></div>
                <div className="field"><label htmlFor="salary-currency">Currency</label><select id="salary-currency" value={preferences.salaryCurrency} onChange={(event) => setPreferences((current) => ({ ...current, salaryCurrency: event.target.value }))}><option>INR</option><option>USD</option><option>EUR</option><option>GBP</option><option>CAD</option><option>AUD</option></select></div>
                <div className="field"><label htmlFor="salary-period">Pay period</label><select id="salary-period" value={preferences.salaryPeriod} onChange={(event) => setPreferences((current) => ({ ...current, salaryPeriod: event.target.value }))}><option>Yearly</option><option>Monthly</option><option>Hourly</option></select></div>
              </div>
              {salaryRangeError && <p className="field-error" role="alert">{salaryRangeError}</p>}
            </section>

            <section className="preference-section">
              <div className="profile-entry-heading"><h2>Work mode</h2></div>
              <p className="section-description">Choose any modes that work for you, or select Flexible / Any.</p>
              <div className="work-mode-options">
                {['Flexible / Any', 'Remote', 'Hybrid', 'On-site'].map((mode) => (
                  <label className={`work-mode-option ${preferences.workModes.includes(mode) ? 'selected' : ''}`} key={mode}>
                    <input type="checkbox" checked={preferences.workModes.includes(mode)} onChange={() => toggleWorkMode(mode)}/>
                    <span>{mode}</span>
                  </label>
                ))}
              </div>
            </section>
            <SectionSave status={preferencesDraft.status} onSave={() => { void saveSection(preferencesDraft, false) }} disabled={Boolean(salaryRangeError)}/>
          </div>)}
          {tab === 'Relocation' && <div className="form-grid">
            <p className="section-description full">The current profile API does not sync relocation details; these are saved in this browser only.</p>
            <div className="field"><label htmlFor="current-country">Current country</label><input id="current-country" value={relocation.currentCountry} onChange={(event) => setRelocation((current) => ({ ...current, currentCountry: event.target.value }))}/></div>
            <div className="field"><label htmlFor="relocate">Willing to relocate</label><select id="relocate" value={relocation.willingness} onChange={(event) => setRelocation((current) => ({ ...current, willingness: event.target.value }))}><option>Not specified</option><option>Yes</option><option>No</option></select></div>
            <div className="field full"><label htmlFor="authorization">Work authorization</label><textarea id="authorization" value={relocation.authorization} onChange={(event) => setRelocation((current) => ({ ...current, authorization: event.target.value }))} placeholder="List countries and authorization status only if you confirm them"/></div>
            <section className="field full preferred-locations">
              <div className="profile-entry-heading"><h2>Preferred countries and cities</h2><span className="badge">Multiple</span></div>
              <p className="section-description">Add countries you are open to. Choose a suggested city or enter a custom city.</p>
              <div className="inline-add">
                <label className="sr-only" htmlFor="preferred-country">Preferred country</label>
                <input id="preferred-country" list="country-suggestions" value={countryInput} onChange={(event) => setCountryInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addPreferredCountry() } }} placeholder="Search or type a country"/>
                <datalist id="country-suggestions">{COUNTRY_SUGGESTIONS.map((country) => <option key={country} value={country}/>)}</datalist>
                <button className="secondary-button" onClick={addPreferredCountry} type="button" disabled={!countryInput.trim()}><Plus size={16}/>Add country</button>
              </div>
              {preferredLocations.length === 0 && <p className="profile-entry-empty">No preferred countries added yet.</p>}
              <div className="preferred-location-list">
                {preferredLocations.map((location) => {
                  const cities = POPULAR_CITIES[location.country.toLowerCase()] ?? []
                  return (
                    <article className="preferred-location-card" key={location.id}>
                      <div className="preferred-location-heading"><strong>{location.country}</strong><button className="entry-remove" type="button" aria-label={`Remove ${location.country}`} onClick={() => setRelocation((current) => ({ ...current, preferredLocations: current.preferredLocations.filter((item) => item.id !== location.id) }))}><Trash2 size={16}/></button></div>
                      <div className="inline-add city-add-row">
                        <label className="sr-only" htmlFor={`suggested-city-${location.id}`}>Suggested city in {location.country}</label>
                        <select id={`suggested-city-${location.id}`} value={citySelections[location.id] ?? ''} onChange={(event) => setCitySelections((items) => ({ ...items, [location.id]: event.target.value }))} disabled={cities.length === 0}>
                          <option value="">{cities.length ? 'Choose a popular city' : 'No city suggestions for this country'}</option>
                          {cities.filter((city) => !location.cities.includes(city)).map((city) => <option key={city} value={city}>{city}</option>)}
                        </select>
                        <button className="secondary-button" type="button" disabled={!citySelections[location.id]} onClick={() => {
                          const city = citySelections[location.id]
                          if (city) addCity(location.id, city)
                          setCitySelections((items) => ({ ...items, [location.id]: '' }))
                        }}>Add city</button>
                      </div>
                      <div className="inline-add city-add-row">
                        <label className="sr-only" htmlFor={`custom-city-${location.id}`}>Custom city in {location.country}</label>
                        <input id={`custom-city-${location.id}`} value={customCityInputs[location.id] ?? ''} onChange={(event) => setCustomCityInputs((items) => ({ ...items, [location.id]: event.target.value }))} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); const city = customCityInputs[location.id] ?? ''; addCity(location.id, city); setCustomCityInputs((items) => ({ ...items, [location.id]: '' })) } }} placeholder="Add a custom city"/>
                        <button className="secondary-button" type="button" disabled={!(customCityInputs[location.id] ?? '').trim()} onClick={() => {
                          addCity(location.id, customCityInputs[location.id] ?? '')
                          setCustomCityInputs((items) => ({ ...items, [location.id]: '' }))
                        }}><Plus size={16}/>Add custom city</button>
                      </div>
                      {location.cities.length > 0 && <ul className="draft-chip-list" aria-label={`Cities in ${location.country}`}>
                        {location.cities.map((city) => <li className="draft-chip" key={city}><span>{city}</span><button type="button" aria-label={`Remove ${city}`} onClick={() => setRelocation((current) => ({ ...current, preferredLocations: current.preferredLocations.map((item) => item.id === location.id ? { ...item, cities: item.cities.filter((existing) => existing !== city) } : item) }))}>×</button></li>)}
                      </ul>}
                    </article>
                  )
                })}
              </div>
            </section>
            <SectionSave status={relocationDraft.status} onSave={() => { void saveSection(relocationDraft, false) }}/>
          </div>}
        </div>
      </div>
    </div>
  )
}

function EntryList({ title, empty, children, sourceLabel }: { title: string; empty: string; children: React.ReactNode; sourceLabel: string }) {
  const hasEntries = Array.isArray(children) ? children.length > 0 : Boolean(children)
  return (
    <section className="profile-entry-section">
      <div className="profile-entry-heading"><h2>{title}</h2><span className="badge">{sourceLabel}</span></div>
      {hasEntries ? <div className="profile-entry-list">{children}</div> : <p className="profile-entry-empty">{empty}</p>}
    </section>
  )
}

function SectionSave({
  status,
  onSave,
  disabled = false,
  submit = false,
}: {
  status: string
  onSave: () => void
  disabled?: boolean
  submit?: boolean
}) {
  return (
    <div className="draft-save-row">
      <span role="status">{status}</span>
      <button className="primary-button" type={submit ? 'submit' : 'button'} onClick={submit ? undefined : onSave} disabled={disabled}>
        <Save size={16}/>Save section
      </button>
    </div>
  )
}
