const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLInt, GraphQLList, GraphQLNonNull } = require('graphql');
const Resolvers = require('./resolvers');
const { CompositeKey } = require('../utils');

// Load the various types the schema will use
const { CurricSearchType, CurricType } = require('./curriculum');
const { TermType, BaseTermType } = require('./term');
const { CourseType, CourseSearchType } = require('./course');
const { SectionType, SectionSearchType, BaseSectionType } = require('./section');
const { SWSPerson, SWSPersonSearch } = require('./swsPerson');
const { CollegeType, CollegeSearchType } = require('./college');
const { RegistrationSearchType, RegistrationType } = require('./registration');
const { EnrollmentSearchType, EnrollmentType } = require('./enrollment');

const sws = {
  GetTerm: {
    type: TermType,
    args: {
      Year: { type: new GraphQLNonNull(GraphQLInt) },
      Quarter: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: (root, args, {loaders}) => {
      return loaders.term.load(CompositeKey(args.Year,args.Quarter));
    }
  },
  GetTermCurrent: {
    type: TermType,
    resolve: (root, args, {loaders}) => loaders.term.load("current")
  }, 
  CurriculumSearch: {
    type: CurricSearchType,
    args: {
      Year: { type: GraphQLInt },
      Quarter: { type: GraphQLString },
      FutureTerms: { type: GraphQLInt },
      CollegeAbbreviation: { type: GraphQLString },
      DeptAbbr: { type: GraphQLString },
      PageStart: { type: GraphQLInt },
      PageSize: { type: GraphQLInt }
    },
    resolve: (root, args, {impersonate}) => Resolvers.SearchCurriculum(args, impersonate)
  },
  GetCurriculum: {
    type: CurricType,
    args: {
      Year: { type: new GraphQLNonNull(GraphQLInt) },
      Quarter: { type: new GraphQLNonNull(GraphQLString) },
      DeptAbbr: { type: GraphQLString }
    },
    resolve: (root, args, {impersonate}) => Resolvers.GetCurriculum(args, impersonate)
  },
  CourseSearch: {
      type: CourseSearchType,
      args: {
          ChangedSinceDate: { type: GraphQLString },
          CourseNumber: { type: GraphQLString },
          CourseTitleContains: { type: GraphQLString },
          CourseTitleStartsWith: { type: GraphQLString },
          CurriculumAbbr: { type: GraphQLString },
          FutureTerms: { type: GraphQLString },
          PageSize: { type: GraphQLInt },
          PageStart: { type: GraphQLInt },
          Quarter:  { type: new GraphQLNonNull(GraphQLString) },
          TranscriptableCourse:  { type: GraphQLString },
          Year:  { type: new GraphQLNonNull(GraphQLInt) },
          ExcludeCoursesWithoutSections: { type: GraphQLString }
      },
      resolve: (root, args, {impersonate}) => Resolvers.SearchCourse(args, impersonate)
  },
  GetCourse: {
      type: CourseType,
      args: {
          Year: { type: new GraphQLNonNull(GraphQLInt) },
          Quarter: { type: new GraphQLNonNull(GraphQLString) },
          Curriculum: { type: new GraphQLNonNull(GraphQLString) },
          CourseNumber: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: (root, args, {loaders}) => loaders.course.load(CompositeKey(args.Year, args.Quarter, args.Curriculum, args.CourseNumber)).then(res => {
          return Object.assign({}, res, {Key: args})
      })
  },
  GetSection: {
      type: SectionType,
      args: {
          Year: { type: new GraphQLNonNull(GraphQLInt) },
          Quarter: { type: new GraphQLNonNull(GraphQLString) },
          CurriculumAbbr: { type: new GraphQLNonNull(GraphQLString) },
          CourseNumber: { type: new GraphQLNonNull(GraphQLInt) },
          SectionId: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (root, args, {loaders}) => loaders.section.load(CompositeKey(args.Year,args.Quarter,args.CurriculumAbbr,args.CourseNumber + '/' + args.SectionId)).then(res => {
          return Object.assign({}, res, {Key: args})
      })
  },
  SectionSearch: {
      type: SectionSearchType,
      args: {
          Year:  { type: new GraphQLNonNull(GraphQLInt) },
          Quarter: { type: new GraphQLNonNull(GraphQLString) },
          CourseNumber: { type: new GraphQLNonNull(GraphQLInt) },
          CurriculumAbbr: { type: new GraphQLNonNull(GraphQLString) },
          FutureTerms: { type: GraphQLString },
          RegId: { type: GraphQLString },
          SearchBy: { type: GraphQLString },
          IncludeSecondaries: { type: GraphQLString },
          ChangedSinceDate: { type: GraphQLString },
          TranscriptableCourse: { type: GraphQLString },
          PageStart: { type: GraphQLInt },
          PageSize: { type: GraphQLInt },
          FacilityCode: { type: GraphQLString },
          RoomNumber: { type: GraphQLString },
          Sln: { type: GraphQLString },
      },
      resolve: (root, args, {impersonate}) => Resolvers.SearchSection(args,impersonate)
  },
  GetSWSPerson: {
    type: SWSPerson,
    args: {
      ID: { type: GraphQLString }
    },
    resolve: (root, args, {loaders}) => loaders.swsPerson.load(args.ID)
  },
  SWSPersonSearch: {
    type: SWSPersonSearch,
    args: {
      EmployeeID: { type: GraphQLString },
      UWNetID: { type: GraphQLString },
      UWRegID: { type: GraphQLString },
      StudentNumber: { type: GraphQLString },
      StudentSystemKey: { type: GraphQLString }
    },
     resolve: (root, args, {impersonate}) => Resolvers.SearchStudentPerson(args, impersonate)
  },
  CollegeSearch: {
    type: CollegeSearchType,
    args: {
      CampusShortName: { type: GraphQLString },
      Quarter: { type: GraphQLString },
      Year: { type: GraphQLInt },
      FutureTerms: { type: GraphQLInt },
      CurrentTerm: { type: GraphQLBoolean },
      PageSize: { type: GraphQLInt },
      PageStart: { type: GraphQLInt }
    },
    resolve: (root, args, {loaders, impersonate}) => {
      let collegeArgs = args;
      if(args.CurrentTerm) {
        let term = loaders.term.load("current");
        collegeArgs = Object.assign({}, args, {Year: term.Year, Quarter: term.Quarter });
      }
      return Resolvers.SearchCollege(collegeArgs, impersonate)
    }
  },
  GetCollege: {
    type: CollegeType,
    args: {
      CollegeAbbreviation: { type: new GraphQLNonNull(GraphQLString) }
    },
    resolve: (root, args, {impersonate}) => Resolvers.GetCollege(args.CollegeAbbreviation, impersonate)
  },
  SearchRegistration: {
    type: RegistrationSearchType,
    args: {
      ChangedSince: { type: GraphQLString },
      CourseNumber: { type: GraphQLInt },
      CurriculumAbbr: { type: GraphQLString },
      InstructorRegID: { type: GraphQLString },
      ActiveRegistration: { type: GraphQLBoolean },
      Quarter: { type: GraphQLString },
      RegID: { type: GraphQLString },
      SectionID: { type: GraphQLString },
      TranscriptableCourse: { type: GraphQLBoolean },
      Year: { type: GraphQLInt },
      PageSize: { type: GraphQLInt },
      PageStart: { type: GraphQLInt }
    },
    resolve: (root, args, {impersonate}) => Resolvers.SearchRegistration(args, impersonate)
  },
  // GetRegistration: {
    
  // },
  SearchEnrollment: {
    type: EnrollmentSearchType,
    args: {
      RegID: { type: GraphQLString }
    },
    resolve: (root, args, {loaders}) => loaders.enrollment.load(args.RegID)
  },
  GetEnrollment: {
    type: EnrollmentType,
    args: {
      RegID: { type: new GraphQLNonNull(GraphQLString) },
      Year: { type: new GraphQLNonNull(GraphQLInt) },
      Quarter: { type: new GraphQLNonNull(GraphQLString) }
    },
    resolve: (root, args, {impersonate}) => require('./resolvers').GetEnrollment(args, impersonate)
  }
}

export default sws;
