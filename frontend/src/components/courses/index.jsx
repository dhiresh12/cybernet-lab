import React, { useState } from 'react';
import CourseCatalog from './CourseCatalog';
import CourseDetail from './CourseDetail';
import CoursePlayer from './CoursePlayer';
import AssessmentComponent from './AssessmentComponent';
import ProjectSubmission from './ProjectSubmission';

const LEARNER_ID = 'default';

export default function CoursesView({ onStartLab }) {
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [stageContext, setStageContext] = useState(null); // { stage, stageIndex }

  function handleSelectCourse(courseId) {
    setSelectedCourseId(courseId);
    setStageContext(null);
  }

  function handleStartStage(stage, stageIndex) {
    setStageContext({ stage, stageIndex });
  }

  function handleStageComplete() {
    setStageContext(null);
  }

  if (selectedCourseId && stageContext) {
    const { stage, stageIndex } = stageContext;
    if (stage.type === 'assessment') {
      return (
        <AssessmentComponent
          courseId={selectedCourseId}
          stage={stage}
          stageIndex={stageIndex}
          learnerId={LEARNER_ID}
          onComplete={handleStageComplete}
          onBack={() => setStageContext(null)}
        />
      );
    }
    if (stage.type === 'project') {
      return (
        <ProjectSubmission
          courseId={selectedCourseId}
          stage={stage}
          stageIndex={stageIndex}
          learnerId={LEARNER_ID}
          onComplete={handleStageComplete}
          onBack={() => setStageContext(null)}
        />
      );
    }
    return (
      <CoursePlayer
        courseId={selectedCourseId}
        stage={stage}
        stageIndex={stageIndex}
        learnerId={LEARNER_ID}
        onComplete={handleStageComplete}
        onBack={() => setStageContext(null)}
      />
    );
  }

  if (selectedCourseId) {
    return (
      <CourseDetail
        courseId={selectedCourseId}
        learnerId={LEARNER_ID}
        onStartStage={handleStartStage}
        onBack={() => setSelectedCourseId(null)}
      />
    );
  }

  return <CourseCatalog onSelectCourse={handleSelectCourse} learnerId={LEARNER_ID} />;
}
