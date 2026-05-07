import { Injectable, Logger } from '@nestjs/common';

interface ScoringDetail {
  qid: string;
  isCorrect: boolean;
  pointsEarned: number;
  correctAnswer: any;
  selectedAnswer: any;
}

@Injectable()
export class AssessmentScoringService {
  private readonly logger = new Logger(AssessmentScoringService.name);
  private compareAnswers(correctAnswer: any, selectedAnswer: any): boolean {
    // If correct answer is an array (multiple answers allowed)
    if (Array.isArray(correctAnswer)) {
      // If selected answer is also an array
      if (Array.isArray(selectedAnswer)) {
        // Check if arrays are equal (same elements, same order)
        return (
          correctAnswer.length === selectedAnswer.length &&
          correctAnswer.every((val, idx) => val === selectedAnswer[idx])
        );
      }
      // Selected is single value but correct is array - false
      return false;
    }

    // If correct answer is single value
    if (Array.isArray(selectedAnswer)) {
      return false;
    }

    return correctAnswer === selectedAnswer;
  }

  validateAndScoreResponses(
    responses: Array<{ qid: string; selected_option: string | string[] }>,
    questionsMap: Map<string, any>, // Map of qid -> question with correct_answer and scores
  ): {
    totalScore: number;
    correctAnswers: number;
    totalQuestions: number;
    detailedResults: ScoringDetail[];
  } {
    const detailedResults: ScoringDetail[] = [];
    let totalScore = 0;
    let correctAnswers = 0;

    const totalQuestions = responses.length;
    console.log("Total Questions",totalQuestions)

    responses.forEach((response) => {
      const question = questionsMap.get(response.qid);

      if (!question) {
        this.logger.warn(`Question ${response.qid} not found in assessment`);
        return;
      }

      const isCorrect = this.compareAnswers(
        question.correctAnswer,
        response.selected_option,
      );
      console.log(question.correctAnswer)
      console.log("correct answer",isCorrect)

      const pointsEarned = isCorrect
        ? question.positiveScore || 1
        : question.negativeScore || 0;

      totalScore += pointsEarned;
      if (isCorrect) correctAnswers++;

      detailedResults.push({
        qid: response.qid,
        isCorrect,
        pointsEarned,
        correctAnswer: question.correctAnswer,
        selectedAnswer: response.selected_option,
      });
    });

    return {
      totalScore,
      correctAnswers,
      totalQuestions,
      detailedResults,
    };
  }


  calculateViolationPenalties(
    violations: Array<{
      violationRule: string;
      violationPoints: number;
    }> = [],
  ): { totalViolationPoints: number; violationDetails: any } {
    let totalViolationPoints = 0;
    const violationDetails: { [key: string]: number } = {};

    violations.forEach((violation) => {
      const { violationRule, violationPoints } = violation;
      totalViolationPoints += violationPoints;

      violationDetails[violationRule] = violationPoints;
    });

    return {
      totalViolationPoints,
      violationDetails,
    };
  }

  calculateFinalScore(
    answerScore: number,
    violationPoints: number = 0,
  ): number {
    const finalScore = Math.max(0, answerScore - violationPoints); // Prevent negative scores
    return finalScore;
  }

  determineStatus(
    finalScore: number,
    totalPossibleScore: number,
    passingPercentage: number = 40, // 40% default passing percentage
  ): string {
    if (totalPossibleScore === 0) {
      return 'COMPLETED';
    }

    const percentage = (finalScore / totalPossibleScore) * 100;
    return percentage >= passingPercentage ? 'PASSED' : 'FAILED';
  }
}
