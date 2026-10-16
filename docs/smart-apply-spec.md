# SmartApply (AI recruiter) — spec recovered from goodwillstaffing.ca

Source: WordPress plugin **"ChatBot Conversational Forms" (QuantumCloud WPBot / Bot Form Builder)**,
conversation **"SmartApply"** (`CF68c9c06a5e697`). An older draft, "recruit" (`CF6795d6ef19334`),
has the same questions and is not used.

## Pages on the live site

- `/smart-apply/` — landing page. Heading **"AI Meets Healthcare Staffing"**, copy:
  "Your next healthcare opportunity is just a click away. SmartApply helps you connect faster with our
  recruiters, streamline your applications, and secure your ideal position quickly and confidently."
  Button **"Experience it Today"** → `/ai-recruiter/`.
- `/ai-recruiter/` — heading **"Let our AI recruiter find your perfect match"** with the chat ("GoodwillBot").
- Navbar item **"SmartApply"** (with a "NEW!" badge) → `/ai-recruiter/`. Footer "SmartApply" → `/smart-apply/`.

## Conversation (bot = GoodwillBot), in order

`%name%` is replaced with the answer to the name question. Users can type **"reset"** to start over.

1. *(bot)* "Hello there! I'm GoodwillBot, here to connect you with exciting healthcare opportunities across
   Canada. Complete the walkthrough steps, and I'll forward them to our human recruiters to match you with
   available opportunities. If you'd like to clear your responses and start fresh at any time, simply type
   "reset" and press Enter. **Let's get started!**"
2. *(text)* "First, can I get your name, please?" → `name`
3. *(bot)* "Thank you, %name%! It's great to meet you. 😊"
4. *(single choice)* "Are you here to explore healthcare job opportunities, or are you looking to hire healthcare
   professionals?" → `intent`: **I'm looking for a job.** | **I'm hiring healthcare staff.**

### Branch A — "I'm looking for a job."

5. *(multi choice)* "Great! What type of healthcare role are you interested in?" → `roles`:
   Registered Nurse (RN), Licensed Practical Nurse (LPN), Registered Practical Nurse (RPN), Nurse Practitioner (NP),
   Allied Health Professional, Physiotherapist, Occupational Therapist, Speech-Language Pathologist, Social Worker,
   Medical Office Assistant (MOA), Personal Support Worker (PSW), Health Care Aide (HCA), Respiratory Therapist,
   Radiologic Technologist, Medical Laboratory Technologist, Dietitian, Paramedic, Pharmacist,
   Physician Assistant (PA), Chiropractor, Recreational Therapist, Public Health Nurse, Community Health Worker,
   Home Care Nurse, Clinical Nurse Specialist (CNS), Mental Health Nurse, School Nurse, Naturopathic Doctor
6. *(multi choice)* "Thanks! Could you share where you'd like to work?" → `locations`: Alberta, British Columbia,
   Manitoba, New Brunswick, Newfoundland and Labrador, Nova Scotia, Ontario, Prince Edward Island, Quebec,
   Saskatchewan, Northwest Territories, Nunavut, Yukon
7. *(multi choice)* "Got it. Are you looking for" → `jobTypes`: Fulltime Staff Positions, Per Diem/PRN, Local contracts
8. *(single choice)* "Are you open to travel opportunities?" → `travel`: YES | NO
9. *(bot)* "Could you tell me a bit about your professional background?"
10. *(text)* "How many years of experience do you have?" → `experience`
11. *(single choice)* "Thank you! Do you currently hold the necessary certifications or licenses for this role in
    Canada?" → `certified`: YES | NO
    - **NO** → *(single choice)* "Okay, we require a minimum certification. Would you like guidance on how to get
      certified?" → `wantsGuidance`: YES | NO
      - **NO** → *(bot)* "Thank you, %name%! 😊 I've gathered all your details. Please note that certification is a
        requirement to proceed with your application. Our recruiter will reach out soon to guide you through the
        next steps." → contact step (14–15) → end
      - **YES** → contact step → *(bot)* "Thanks, %name%! 😊 I've collected all the details. Our recruiter will
        reach out to you soon to discuss your certification needs." → end
    - **YES** → continue
12. *(text)* "When would you be available to start?" → `startDate`
13. *(file)* "Upload your Resume/CV" → `resume` (PDF/DOC/DOCX)
14. *(single choice)* "Almost done! What's the best way for our recruiter to reach you?" → `contactMethod`: EMAIL | PHONE
15. *(text)* "Enter your email" (if EMAIL) / "Enter Your Phone Number" (if PHONE) → `email` / `phone`
16. End → "Return to our Home Page" button (orange pill, `#e84b2c`) → `/`

### Branch B — "I'm hiring healthcare staff."

5. *(bot)* "Fantastic! Let's help you find the perfect candidates"
6. *(text)* "What type of role are you looking to fill?" → `roleToFill`
7. *(multi choice)* "Where is your organization located?" → `orgLocations` (same 13 provinces/territories)
8. *(single choice)* "How soon do you need to fill this role?" → `urgency`: Immediately | Within the next month |
   Flexible timeline
9. *(single choice)* "Finally, what's the best way for us to follow up with you?" → `contactMethod`: Phone | Email
10. *(text)* "Enter your email" / "Enter Your Phone Number"
11. *(bot)* "Thank you! Our team will contact you soon to discuss your staffing needs in more detail. Have a great
    day!" → "Return to our Home Page" button

## On completion (live settings)

- Saves an entry; emails **info@goodwillstaffing.ca, harini@goodwillstaffing.ca, careers@goodwillstaffing.ca**
  with subject **"Notification: New Smart Apply Submission"**, sender name **"Goodwill Smart Apply"**.
