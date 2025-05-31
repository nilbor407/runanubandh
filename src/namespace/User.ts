import { ObjectId } from 'mongoose';

export type UserType = {
  _id?: ObjectId;
  username: string;
  email: string;
  password: string;
  age?: number;
  mobileNumber: string;
  userDetails: UserDetails;
  paymentInfo?: PaymentInfo;
  orderInfo?: orderInfo;
  photoDetails: PhotoDetails;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  token: string;
  otp?: number;
  status: 'ACTIVE' | 'PENDING' | 'REJECTED' | 'HOLD';
};

interface UserDetails {
  personalDetails: PersonalDetails;
  basicDetails: BasicDetails;
  familyDetails: FamilyDetails;
  addressDetails: AddressDetails;
  partnerpreferences: PartnerPreferences;
}

interface PhotoDetails {
  adharCard: string;
  profilePhoto: string;
}
interface PersonalDetails {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  timeOfBirth: string;
  marriageStatus: MarriageStatus;
  bornPlace: string;
  gender: 'Male' | 'Female' | 'Other';
  religion: string;
  caste: string;
  bloodGroup: string;
  farm?: string;
  fullName?: string;
}

interface BasicDetails {
  education: string;
  occupation: string;
  income: number;
  height: string;
  weight?: string;
  skinColor: string;
  rashi?: string;
  nakshatra?: string;
}

interface FamilyDetails {
  motherName: string;
  motherMobileNumber: string;
  fatherName: string;
  fatherMobileNumber: string;
  brotherName?: number;
  brotherMobileNumber: string;
  sisterName?: string;
  sisterMobileNumber: string;
  numOfBrothers: string;
  numOfSisters: string;
}

interface AddressDetails {
  address: string;
  pincode: string;
  city: string;
  taluka: string;
  district: number;
  state: string;
  tempAddress: string;
}

interface PartnerPreferences {
  PPAnnualIncome: string;
  PPCaste: string;
  PPEducation: string;
  PPResidingCountry: string;
  PPResidingState: string;
  PPResidingCity: string;
  PPHeight: string;
  PPWeight: string;
  PPSkinColor: string;
}

export type PaymentInfo = {
  status: string;
  orderDetails?: {
    orderId: string;
    paymentId: { current: string };
    signature: string;
  };
};

export type orderInfo = {
  orderId: string;
  currency: string;
  amount: number | string;
};

enum MarriageStatus {
  Single = 'Single',
  Married = 'Married',
  Widowed = 'Widowed',
  Divorced = 'Divorced',
  Separated = 'Separated',
}

export type JWTResponse = {
  userId: string;
};
