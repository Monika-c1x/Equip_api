import { ObjectType, Field, InputType } from '@nestjs/graphql';

@ObjectType()
export class CandidateType {
  @Field()
  id!: string;

  @Field()
  email!: string;

  @Field({ nullable: true })
  firstName!: string;

  @Field({ nullable: true })
  lastName!: string;

  @Field()
  emailVerified!: boolean;

  @Field()
  createdAt!: Date;
}

@ObjectType()
export class SendOtpResponse {
  @Field()
  sessionId!: string;

  @Field()
  message!: string;

  @Field()
  expiresIn!: number;
}

@ObjectType()
export class VerifyOtpResponse {
  @Field()
  token!: string;

  @Field(() => CandidateType)
  candidate!: CandidateType;

  @Field()
  message!: string;
}

@ObjectType()
export class GenerateInviteResponse {
  @Field()
  inviteToken!: string;

  @Field()
  inviteLink!: string;

  @Field()
  expiresAt!: Date;

  @Field()
  message!: string;
}

@InputType()
export class SendOtpInput {
  @Field()
  email!: string;

  @Field()
  inviteToken!: string;
}

@InputType()
export class VerifyOtpInput {
  @Field()
  sessionId!: string;

  @Field()
  otp!: string;

  @Field({ nullable: true })
  firstName!: string;

  @Field({ nullable: true })
  lastName!: string;
}

@InputType()
export class GenerateInviteInput {
  @Field()
  email!: string;

  @Field({ nullable: true })
  expiryMinutes!: number;
}
