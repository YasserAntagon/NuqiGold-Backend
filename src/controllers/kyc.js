const jwt = require('jsonwebtoken');
const KYC = require('../models/kyc');
const userModel = require('../models/users');

const createKYCRecord = async (req, res) => {
  try {
    const { token } = req.body;
    const { userId } = req.user_id

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    let decoded;
    try {
      // Decoding the token to get the payload
      decoded = jwt.decode(token, { complete: true });
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    console.log(JSON.stringify(decoded))


    // Extracting the relevant data from the decoded JWT payload
    const { kid } = decoded.header;
    const { aud, data, iss, exp, iat, jti } = decoded.payload;
    const { source, documents } = data;
    const { sdkType, sdkVersion, sourceIp } = source;
    const document = documents[0];
    const { documentType, scan, face } = document;
    const { front, back } = scan;

    // Use userId from req.body or fall back to a userId in the token payload if available;
    if (!req.user_id) {
      return res.status(400).json({ error: 'UserId is required' });
    }

    if (await KYC.findOne({ where: { userId: req.user_id } }).userId) {
      return res.status(400).json({ error: 'KYC already verified' });
    }
    // Create the new KYC record
    const newKYC = await KYC.create({
      userId: req.user_id,  // Ensuring userId is set
      kid,
      aud,
      sdkType,
      sdkVersion,
      sourceIp,
      documentType,
      fullName: front.fullName,
      fullNameHindi: front.fullNameHindi,
      dateOfBirth: front.dateOfBirth,
      sex: front.sex,
      address: back.address,
      faceImageId: scan.faceImageId,
      frontImageId: scan.frontImageId,
      backImageId: scan.backImageId,
      match: face.match,
      matchLevel: face.matchLevel,
      error: face.error,
      falseAcceptRate: face.falseAcceptRate,
      auditTrailImageId: face.auditTrailImageId,
      iss,
      exp,
      iat,
      jti,
    });
    ;

    const user = userModel.update({ is_kyc_verified: true }, { where: { id: req.user_id } })
    if (!user) {
      return res.status(200).json({ error: 'User not found', newKYC });
    }
    return res.status(201).json(newKYC);

  } catch (error) {
    console.error('Error creating KYC record:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createKYCRecord,
};
