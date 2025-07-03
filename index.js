const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());
app.use(express.json({ limit: "10mb" }));

// Below transport created to "send" the email app.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

app.post("/api/submit-application", (req, res) => {
  const applicationData = req.body;
  console.log("APPLICATION RECEIVED...");
  console.log("Signature Data:", applicationData.signature.slice(0, 100));


  const htmlBody = `
    <h1>Figlet's Construction LLC</h1>  
    <h2>Job Application Received!</h2>

    <br/>

    <h3 style="text-decoration: underline">Applicant Information</h3>
    <table border="1" cellpadding="5" cellspacing="5" style="width: 100%; max-width: 600px">
      <tr>
        <td><strong>Application Date:</strong></td>
        <td>${applicationData.formDate}</td>
      </tr> 
      <tr>
        <td><strong>Applicant Name:</strong></td>
        <td>${applicationData.fullName}</td>
      </tr> 
      <tr>
        <td><strong>Social Security Number/TIN #:</strong></td>
        <td>${applicationData.ssn}</td>
      </tr> 
      <tr>
        <td><strong>Address:</strong></td>
        <td>${applicationData.address}</td>
      </tr> 
      <tr>
        <td><strong>City, State, and Zip Code:</strong></td>
        <td>${applicationData.cityStateZip}</td>
      </tr> 
      <tr>
        <td><strong>Telephone:</strong></td>
        <td>${applicationData.phone}</td>
      </tr> 
      <tr>
        <td><strong>Date Of Birth:</strong></td>
        <td>${applicationData.dob}</td>
      </tr> 
      <tr>
        <td><strong>Age:</strong></td>
        <td>${applicationData.age}</td>
      </tr> 
      <tr>
        <td><strong>Smoker?:</strong></td>
        <td>${applicationData.smoker}</td>
      </tr> 
      <tr>
        <td><strong>Are you a US citizen or approved to work in the United States?:</strong></td>
        <td>${applicationData.citizenship}</td>
      </tr> 
      <tr>
        <td><strong>Can you provide proof of citizenship or legal status?:</strong></td>
        <td>${applicationData.proofOfCitizenship}</td>
      </tr> 
      <tr>
        <td><strong>Will you consent to a mandatory controlled substance test?:</strong></td>
        <td>${applicationData.drugTest}</td>
      </tr> 
      <tr>
        <td><strong>Do you have any condition(s) which would require job accommodations?:</strong></td>
        <td>${applicationData.accommodations}</td>
      </tr> 
      <tr>
        <td><strong>If yes, please describe accommodations required:</strong></td>
        <td>${applicationData.accommodationsExplain || "n/a"}</td>
      </tr> 
      <tr>
        <td><strong>Have you ever been convicted of a criminal offense (felony or misdemeanor)?:</strong></td>
        <td>${applicationData.criminalHistory}</td>
      </tr> 
      <tr>
        <td><strong>If yes, please state the nature of the crime(s), when and where convicted, and
          disposition of the case:</strong></td>
        <td>${applicationData.criminalHistoryExplain || "n/a"}</td>
      </tr> 
      <tr>
        <td><strong>Do you consent to a background check?:</strong></td>
        <td>${applicationData.backgroundCheck}</td>
      </tr> 
      <tr>
        <td><strong>Do you have any medical conditions past or present? Please specify:</strong></td>
        <td>${applicationData.medicalConditions}</td>
      </tr> 
    </table>

    <br/>
    <br/>

    <h3 style="text-decoration: underline">Employment Position</h3>
    <table border="1" cellpadding="5" cellspacing="5" style="width: 100%; max-width: 600px">
      <tr>
        <td><strong>Position(s) Applying For:</strong></td>
        <td>${applicationData.positionApplyingFor}</td>
      </tr> 
      <tr>
        <td><strong>How did you hear about us?:</strong></td>
        <td>${applicationData.heardFrom}</td>
      </tr> 
      <tr>
        <td><strong>Are you able to work Monday-Friday:</strong></td>
        <td>${applicationData.monThroughFri}</td>
      </tr> 
      <tr>
        <td><strong>If needed, are you able to work overtime?:</strong></td>
        <td>${applicationData.overtime}</td>
      </tr> 
      <tr>
        <td><strong>Are you able to work odd and extensive hours?:</strong></td>
        <td>${applicationData.oddExtensiveHours}</td>
      </tr> 
      <tr>
        <td><strong>Are you able to work weekends?:</strong></td>
        <td>${applicationData.weekends}</td>
      </tr> 
      <tr>
        <td><strong>Available start date?:</strong></td>
        <td>${applicationData.startDate}</td>
      </tr> 
      <tr>
        <td><strong>Do you have reliable transportation to and from work?:</strong></td>
        <td>${applicationData.reliableTransportation}</td>
      </tr> 
      <tr>
        <td><strong>Are you able to lift up to 80lbs alone?:</strong></td>
        <td>${applicationData.liftWeight}</td>
      </tr> 
      <tr>
        <td><strong>Have any machinery experience?:</strong></td>
        <td>${applicationData.machineryExperience}</td>
      </tr> 
      <tr>
        <td><strong>List with years of machinery experience:</strong></td>
        <td>${applicationData.yearsWithMachineryExperience}</td>
      </tr> 
      <tr>
        <td><strong>Are you able to wear face masks for long periods of time, which may exceed up to 4 hours?:</strong></td>
        <td>${applicationData.faceMasks}</td>
      </tr> 
    </table>

    <br/>
    <br/>

    <h3 style="text-decoration: underline">Job Skills/Qualifications</h3>
    <table border="1" cellpadding="5" cellspacing="5" style="width: 100%; max-width: 600px">
      <tr>
        <td><strong>Please list below the skills/qualifications you possess for the position for which you are applying:</strong></td>
        <td>${applicationData.jobSkillsQualifications}</td>
      </tr> 
    </table>

      <br/>
      <br/>

    <h3 style="text-decoration: underline">Education and Training</h3>
    <table border="1" cellpadding="5" cellspacing="5" style="width: 100%; max-width: 600px">
      <tr>
        <td><strong>Highschool name?:</strong></td>
        <td>${applicationData.highschoolName || "n/a"}</td>
      </tr> 
      <tr>
        <td><strong>Highschool location (city/state):</strong></td>
        <td>${applicationData.highschoolLocation || "n/a"}</td>
      </tr> 
      <tr>
        <td><strong>Highschool year graduated?:</strong></td>
        <td>${applicationData.highschoolYearGraduated || "n/a"}</td>
      </tr> 
      <tr>
        <td><strong>Highschool degree earned?:</strong></td>
        <td>${applicationData.highSchoolDegreeEarned || "n/a"}</td>
      </tr> 
      <tr>
        <td><strong>College name?:</strong></td>
        <td>${applicationData.collegeName || "n/a"}</td>
      </tr> 
      <tr>
        <td><strong>College location (city/state):</strong></td>
        <td>${applicationData.collegeLocation || "n/a"}</td>
      </tr> 
      <tr>
        <td><strong>College year graduated?:</strong></td>
        <td>${applicationData.collegeYearGraduated || "n/a"}</td>
      </tr> 
      <tr>
        <td><strong>College degree earned?:</strong></td>
        <td>${applicationData.collegeDegreeEarned || "n/a"}</td>
      </tr> 
      <tr>
        <td><strong>Vocational school/Specialized training name?:</strong></td>
        <td>${applicationData.specializedtrainingName || "n/a"}</td>
      </tr> 
      <tr>
        <td><strong>Vocational school/Specialized training location (city/state):</strong></td>
        <td>${applicationData.specializedtrainingLocation || "n/a"}</td>
      </tr> 
      <tr>
        <td><strong>Vocational school/Specialized training year graduated?:</strong></td>
        <td>${applicationData.specializedtrainingYearGraduated || "n/a"}</td>
      </tr> 
      <tr>
        <td><strong>Vocational school/Specialized training degree earned?:</strong></td>
        <td>${applicationData.specializedtrainingDegreeEarned || "n/a"}</td>
      </tr> 
    </table>

    <br/>
    <br/>

    <h3 style="text-decoration: underline">Military</h3>
    <table border="1" cellpadding="5" cellspacing="5" style="width: 100%; max-width: 600px">
      <tr>
        <td><strong>Are you a member of the Armed Services?:</strong></td>
        <td>${applicationData.memberOfArmedService}</td>
      </tr> 
      <tr>
        <td><strong>What branch of the military did you enlist?:</strong></td>
        <td>${applicationData.militaryBranch || "n/a"}</td>
      </tr> 
      <tr>
        <td><strong>Are you still active?:</strong></td>
        <td>${applicationData.militaryStillActive || "n/a"}</td>
      </tr> 
      <tr>
        <td><strong>How many years did you serve?:</strong></td>
        <td>${applicationData.MilitaryYearsServed || "n/a"}</td>
      </tr> 
    </table>

    <br/>
    <br/>

    <h3 style="text-decoration: underline">Previous Employment</h3>
    <table border="1" cellpadding="5" cellspacing="5" style="width: 100%; max-width: 600px">
      <tr>
        <td><strong>Employer Name:</strong></td>
        <td>${applicationData.employerName}</td>
      </tr> 
      <tr>
        <td><strong>Job Title:</strong></td>
        <td>${applicationData.jobTitle}</td>
      </tr> 
      <tr>
        <td><strong>Supervisor Name:</strong></td>
        <td>${applicationData.supervisorName}</td>
      </tr> 
      <tr>
        <td><strong>Employer Address:</strong></td>
        <td>${applicationData.employerAddress}</td>
      </tr> 
      <tr>
        <td><strong>Employer Telephone:</strong></td>
        <td>${applicationData.employerPhone}</td>
      </tr> 
      <tr>
        <td><strong>Dates Employed:</strong></td>
        <td>${applicationData.employmentStart}-${applicationData.employmentEnd}</td>
      </tr> 
      <tr>
        <td><strong>Reason for leaving:</strong></td>
        <td>${applicationData.reasonForLeaving}</td>
      </tr> 
    </table>

    <br/>
    <br/>

    <h3 style="text-decoration: underline">References</h3>
    <table border="1" cellpadding="5" cellspacing="5" style="width: 100%; max-width: 600px">
      <tr>
        <td><strong>Reference Name:</strong></td>
        <td>${applicationData.reference1Name}</td>
      </tr> 
      <tr>
        <td><strong>Reference Phone Number:</strong></td>
        <td>${applicationData.reference1Phone}</td>
      </tr> 
      <tr>
        <td><strong>Reference Relationship:</strong></td>
        <td>${applicationData.reference1Relationship}</td>
      </tr> 
      <tr>
        <td><strong>Reference Name:</strong></td>
        <td>${applicationData.reference2Name || "n/a"}</td>
      </tr> 
      <tr>
        <td><strong>Reference Phone Number:</strong></td>
        <td>${applicationData.reference2Phone || "n/a"}</td>
      </tr> 
      <tr>
        <td><strong>Reference Relationship:</strong></td>
        <td>${applicationData.reference2Relationship || "n/a"}</td>
      </tr> 
    </table>

    <br/>
    <br/>

    <h3 style="text-decoration: underline">Certification</h3>
    <table border="1" cellpadding="5" cellspacing="5" style="width: 100%; max-width: 600px">
      <tr>
        <td><strong>I have carefully read the above certification and I understand and agree to its terms:</strong></td>
        <td>${applicationData.certificationAgreed}</td>
      </tr> 
      <tr>
        <td><strong>Date:</strong></td>
        <td>${applicationData.signatureDate}</td>
      </tr> 
      <tr>
        <td><strong>Signature:</strong></td>
      </tr> 
      <tr>
        <td>
          <img src="${applicationData.signature}" alt="Signature Image" style="max-width: 300px; height: auto"/>
        </td>
      </tr> 
    </table>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    // to: "figlets.const@gmail.com",
    to: "maxwalker23@gmail.com",
    subject: "New Job Application Submitted From Figlet's Website",
    html: htmlBody,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if(error) {
      console.log("EMAIL ERROR!!:", error);
      return res.status(500).json({message: "Email failed to send"});
    }
    console.log("EMAIL SENT SUCCESSFULLY!!:", info.response);
    res.status(200).json({message: "Application received and emailed"})
  });
});

app.listen(PORT, () => {
  console.log(`Live on port ${PORT}`);
});
