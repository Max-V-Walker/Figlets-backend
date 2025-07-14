const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(
  cors({ origin: "https://figlets-frontend.netlify.app", methods: ["POST"] })
);
app.use(express.json());
app.use(express.json({ limit: "10mb" }));

app.get("/api/google-reviews", async (req, res) => {
  const placeId = "ChIJw0wKuxFXnawRuJHrTYdG988";
  const apiKey = process.env.GOOGLE_API_KEY;

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=rating,user_ratings_total,reviews&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      return res
        .status(500)
        .json({ error: "Failed to fetch place details", details: data });
    }

    res.json({
      name: data.result.name,
      rating: data.result.rating,
      totalReviews: data.result.user_ratings_total,
      reviews: data.result.reviews,
      photos: data.result.photos,
    });
  } catch (error) {
    console.error("Error fetching Google reviews:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/submit-application", async (req, res) => {
  const applicationData = req.body;
  console.log("Application received on backend");

  function formatDate(dateStr) {
    const [year, month, day] = dateStr.split("-");
    return `${month}/${day}/${year}`;
  }

  const htmlBody = `
  <div style="margin: 0 auto; padding: 5px;">
  <h1 style="margin-bottom: -10px">Figlet's Construction LLC</h1>  
    <h2>New Job Application Received From ${applicationData.fullName}.</h2>

    <br/>

    <h3 style="text-decoration: underline">Applicant Information</h3>
    <table border="1" cellpadding="5" cellspacing="5" style="width: 100%; max-width: 600px">
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Application Date:</strong></td>
        <td style="width: 50%; word-break: break-word;">${formatDate(
          applicationData.formDate
        )}</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Applicant Name:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.fullName
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Social Security Number/TIN #:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.ssn
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Address:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.address
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>City, State, and Zip Code:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.cityStateZip
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Telephone:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.phone
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Date Of Birth:</strong></td>
        <td style="width: 50%; word-break: break-word;">${formatDate(
          applicationData.dob
        )}</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Age:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.age
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Smoker?:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.smoker
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Are you a US citizen or approved to work in the United States?:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.citizenship
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Can you provide proof of citizenship or legal status?:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.proofOfCitizenship
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Will you consent to a mandatory controlled substance test?:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.drugTest
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Do you have any condition(s) which would require job accommodations?:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.accommodations
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>If yes, please describe accommodations required:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.accommodationsExplain || "n/a"
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Have you ever been convicted of a criminal offense (felony or misdemeanor)?:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.criminalHistory
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>If yes, please state the nature of the crime(s), when and where convicted, and
          disposition of the case:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.criminalHistoryExplain || "n/a"
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Do you consent to a background check?:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.backgroundCheck
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Do you have any medical conditions past or present? Please specify:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.medicalConditions
        }</td>
      </tr>
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>If yes, please state the nature of the crime(s), when and where convicted, and
          disposition of the case:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.medicalConditionsExplain || "n/a"
        }</td>
      </tr> 
    </table>

    <br/>
    <br/>

    <h3 style="text-decoration: underline">Employment Position</h3>
    <table border="1" cellpadding="5" cellspacing="5" style="width: 100%; max-width: 600px">
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Position(s) Applying For:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.positionApplyingFor
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>How did you hear about us?:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.heardFrom
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Are you able to work Monday-Friday:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.monThroughFri
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>If needed, are you able to work overtime?:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.overtime
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Are you able to work odd and extensive hours?:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.oddExtensiveHours
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Are you able to work weekends?:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.weekends
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Available start date?:</strong></td>
        <td style="width: 50%; word-break: break-word;">${formatDate(
          applicationData.startDate
        )}</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Do you have reliable transportation to and from work?:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.reliableTransportation
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Are you able to lift up to 80lbs alone?:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.liftWeight
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Have any machinery experience?:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.machineryExperience
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>List with years of machinery experience:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.yearsWithMachineryExperience
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Are you able to wear face masks for long periods of time, which may exceed up to 4 hours?:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.faceMasks
        }</td>
      </tr> 
    </table>

    <br/>
    <br/>

    <h3 style="text-decoration: underline">Job Skills/Qualifications</h3>
    <table border="1" cellpadding="5" cellspacing="5" style="width: 100%; max-width: 600px">
      <tr>
        <td style="font-weight: bold; width: 35%; background-color: #f9f9f9; vertical-align: top;"><strong>Please list below the skills/qualifications you possess for the position for which you are applying:</strong></td>
        <td style="width: 65%; word-break: break-word;">${
          applicationData.jobSkillsQualification
        }</td>
      </tr> 
    </table>

      <br/>
      <br/>

    <h3 style="text-decoration: underline">Education and Training</h3>
    <table border="1" cellpadding="5" cellspacing="5" style="width: 100%; max-width: 600px">
      <tr>
        <td style="font-weight: bold; width: 35%; background-color: #f9f9f9; vertical-align: top;"><strong>Highschool name?:</strong></td>
        <td style="width: 65%; word-break: break-word;">${
          applicationData.highschoolName || "n/a"
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 35%; background-color: #f9f9f9; vertical-align: top;"><strong>Highschool location (city/state):</strong></td>
        <td style="width: 65%; word-break: break-word;">${
          applicationData.highschoolLocation || "n/a"
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 35%; background-color: #f9f9f9; vertical-align: top;"><strong>Highschool year graduated?:</strong></td>
        <td style="width: 65%; word-break: break-word;">${
          applicationData.highschoolYearGraduated || "n/a"
        }</td>
      </tr> 
      </table>

      <br/>

      <table border="1" cellpadding="5" cellspacing="5" style="width: 100%; max-width: 600px">
      <tr>
        <td style="font-weight: bold; width: 35%; background-color: #f9f9f9; vertical-align: top;"><strong>College name?:</strong></td>
        <td style="width: 65%; word-break: break-word;">${
          applicationData.collegeName || "n/a"
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 35%; background-color: #f9f9f9; vertical-align: top;"><strong>College location (city/state):</strong></td>
        <td style="width: 65%; word-break: break-word;">${
          applicationData.collegeLocation || "n/a"
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 35%; background-color: #f9f9f9; vertical-align: top;"><strong>College year graduated?:</strong></td>
        <td style="width: 65%; word-break: break-word;">${
          applicationData.collegeYearGraduated || "n/a"
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 35%; background-color: #f9f9f9; vertical-align: top;"><strong>College degree earned?:</strong></td>
        <td style="width: 65%; word-break: break-word;">${
          applicationData.collegeDegreeEarned || "n/a"
        }</td>
      </tr>
      </table>

      <br/>

      <table border="1" cellpadding="5" cellspacing="5" style="width: 100%; max-width: 600px">
      <tr>
        <td style="font-weight: bold; width: 35%; background-color: #f9f9f9; vertical-align: top;"><strong>Vocational school/Specialized training name?:</strong></td>
        <td style="width: 65%; word-break: break-word;">${
          applicationData.specializedtrainingName || "n/a"
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 35%; background-color: #f9f9f9; vertical-align: top;"><strong>Vocational school/Specialized training location (city/state):</strong></td>
        <td style="width: 65%; word-break: break-word;">${
          applicationData.specializedtrainingLocation || "n/a"
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 35%; background-color: #f9f9f9; vertical-align: top;"><strong>Vocational school/Specialized training year graduated?:</strong></td>
        <td style="width: 65%; word-break: break-word;">${
          applicationData.specializedtrainingYearGraduated || "n/a"
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 35%; background-color: #f9f9f9; vertical-align: top;"><strong>Vocational school/Specialized training degree earned?:</strong></td>
        <td style="width: 65%; word-break: break-word;">${
          applicationData.specializedtrainingDegreeEarned || "n/a"
        }</td>
      </tr> 
    </table>

    <br/>
    <br/>

    <h3 style="text-decoration: underline">Military</h3>
    <table border="1" cellpadding="5" cellspacing="5" style="width: 100%; max-width: 600px">
      <tr>
        <td style="font-weight: bold; width: 60%; background-color: #f9f9f9; vertical-align: top;"><strong>Are you a member of the Armed Services?:</strong></td>
        <td style="width: 40%; word-break: break-word;">${
          applicationData.memberOfArmedService
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 60%; background-color: #f9f9f9; vertical-align: top;"><strong>What branch of the military did you enlist?:</strong></td>
        <td style="width: 40%; word-break: break-word;">${
          applicationData.militaryBranch || "n/a"
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 60%; background-color: #f9f9f9; vertical-align: top;"><strong>Are you still active?:</strong></td>
        <td style="width: 40%; word-break: break-word;">${
          applicationData.militaryStillActive || "n/a"
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 60%; background-color: #f9f9f9; vertical-align: top;"><strong>How many years did you serve?:</strong></td>
        <td style="width: 40%; word-break: break-word;">${
          applicationData.MilitaryYearsServed || "n/a"
        }</td>
      </tr> 
    </table>

    <br/>
    <br/>

    <h3 style="text-decoration: underline">Previous Employment</h3>
    <table border="1" cellpadding="5" cellspacing="5" style="width: 100%; max-width: 600px">
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Employer 1 Name:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.employer1Name
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Job 1 Title:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.job1Title
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Supervisor 1 Name:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.supervisor1Name
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Employer 1 Address:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.employer1Address
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Employer 1 Telephone:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.employer1Phone
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Dates Employed:</strong></td>
        <td style="width: 50%; word-break: break-word;">${formatDate(
          applicationData.employment1Start
        )} - ${formatDate(applicationData.employment1End)}</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Reason for leaving:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.reasonForLeaving1
        }</td>
      </tr> 
    </table>

    <br />
    <table border="1" cellpadding="5" cellspacing="5" style="width: 100%; max-width: 600px">
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Employer 2 Name:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.employer2Name
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Job 2 Title:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.job2Title
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Supervisor 2 Name:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.supervisor2Name
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Employer 2 Address:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.employer2Address
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Employer 2 Telephone:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.employer2Phone
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Dates Employed:</strong></td>
        <td style="width: 50%; word-break: break-word;">${formatDate(
          applicationData.employment2Start
        )} - ${formatDate(applicationData.employment2End)}</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 50%; background-color: #f9f9f9; vertical-align: top;"><strong>Reason for leaving:</strong></td>
        <td style="width: 50%; word-break: break-word;">${
          applicationData.reasonForLeaving2
        }</td>
      </tr> 
    </table>

    <br/>
    <br/>

    <h3 style="text-decoration: underline">References</h3>
    <table border="1" cellpadding="5" cellspacing="5" style="width: 100%; max-width: 600px">
      <tr>
        <td style="font-weight: bold; width: 40%; background-color: #f9f9f9; vertical-align: top;"><strong>Reference 1 Name:</strong></td>
        <td style="width: 60%; word-break: break-word;">${
          applicationData.reference1Name
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 40%; background-color: #f9f9f9; vertical-align: top;"><strong>Reference 1 Phone Number:</strong></td>
        <td style="width: 60%; word-break: break-word;">${
          applicationData.reference1Phone
        }</td>
      </tr> 
      <tr style={{margin-bottom: 25px}}>
        <td style="font-weight: bold; width: 40%; background-color: #f9f9f9; vertical-align: top;"><strong>Reference 1 Relationship:</strong></td>
        <td style="width: 60%; word-break: break-word;">${
          applicationData.reference1Relationship
        }</td>
      </tr> 
      </table>

      <br/>

      <table border="1" cellpadding="5" cellspacing="5" style="width: 100%; max-width: 600px">
      <tr>
        <td style="font-weight: bold; width: 40%; background-color: #f9f9f9; vertical-align: top;"><strong>Reference 2 Name:</strong></td>
        <td style="width: 60%; word-break: break-word;">${
          applicationData.reference2Name || "n/a"
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 40%; background-color: #f9f9f9; vertical-align: top;"><strong>Reference 2 Phone Number:</strong></td>
        <td style="width: 60%; word-break: break-word;">${
          applicationData.reference2Phone || "n/a"
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 40%; background-color: #f9f9f9; vertical-align: top;"><strong>Reference 2 Relationship:</strong></td>
        <td style="width: 60%; word-break: break-word;">${
          applicationData.reference2Relationship || "n/a"
        }</td>
      </tr> 
    </table>

    <br/>
    <br/>

    <h3 style="text-decoration: underline">Certification</h3>
    <table border="1" cellpadding="5" cellspacing="5" style="width: 100%; max-width: 600px">
      <tr>
        <td style="font-weight: bold; width: 60%; background-color: #f9f9f9; vertical-align: top;"><strong>I have carefully read the above certification and I understand and agree to its terms:</strong></td>
        <td style="width: 40%; word-break: break-word;">${
          applicationData.certificationAgreed
        }</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 60%; background-color: #f9f9f9; vertical-align: top;"><strong>Certification Date:</strong></td>
        <td style="width: 40%; word-break: break-word;">${formatDate(
          applicationData.signatureDate
        )}</td>
      </tr> 
      <tr>
        <td style="font-weight: bold; width: 60%; background-color: #f9f9f9; vertical-align: top;"><strong>Signature:</strong>
        </td>
        <td style="width: 40%; word-break: break-word;"></td>
      </tr>
        <td colspan="2" style="text-align: center; padding-top: 10px;">
          <img src="{{SIGNATURE_SRC}}" alt="Signature Image" style="width: 65%; max-width: 325px; height: auto"/>
        </td>
      </tr> 
    </table>
  </div>
  `;

  try {
    const base64Signature = applicationData.signature;
    const htmlForPDF = htmlBody.replace("{{SIGNATURE_SRC}}", base64Signature);
    const htmlForEmail = htmlBody.replace(
      "{{SIGNATURE_SRC}}",
      "cid:signatureImage"
    );

    // Launch puppeteer to render HTML as PDF
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    await page.setContent(htmlForPDF);
    console.log("Generating PDF..")
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    // Below transport created to "send" the email app.
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      // to: "figlets.const@gmail.com",
      to: "maxwalker23@gmail.com",
      subject: `New Application from ${
        applicationData.fullName
      } - ${new Date().toLocaleString()}`,
      html: htmlForEmail,
      attachments: [
        {
          filename: "signature.png",
          content: applicationData.signature.replace(
            /^data:image\/\w+;base64,/,
            ""
          ),
          // ^  strips base64 header
          encoding: "base64",
          cid: "signatureImage",
        },
        {
          filename: `${applicationData.fullName
            .split(" ")
            .join("")}Application`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      console.log("Sending email..")
      if (error) {
        console.log("EMAIL ERROR!!:", error);
        return res.status(500).json({ message: "Email failed to send" });
      }
      console.log("EMAIL SENT SUCCESSFULLY!!:", info.response);
      res.status(200).json({ message: "Application received and emailed" });
    });
  } catch (err) {
    console.error("BACKEND ERROR!!: ", err);
    res.status(500).json({ error: "INTERNAL SERVER ERROR" });
  }
});

app.listen(PORT, () => {
  console.log(`Live on port ${PORT}`);
});
