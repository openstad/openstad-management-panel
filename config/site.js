exports.configSchema = {
  basicAuth:
    [
      {
        key: 'active',
        type: 'boolean',
        default: false,
        label: "Is active?"
      },
      {
        key: 'user',
        type: 'string',
        default: 'openstad',
        label: "Username"
      },
      {
        key: 'password',
        type: 'string',
        default: 'LqKNcKC7',
        label: "Password"
      },
  ],
  ideas:  [
    {
      key: 'canAddNewIdeas',
      type: 'boolean',
      default: true,
      label: "Possible to send in ideas?"
    },
    {
      key: 'minimumYesVotes',
      type: 'number',
      default: 100,
      label: "Minimum votes needed for idea?"
    },
    {
      key: 'titleMinLength',
      type: 'number',
      default: 10,
      label: "Minimum length of title"
    },
    {
      key: 'titleMaxLength',
      type: 'number',
      label: "Maximum length of title"
    },
    {
      key: 'summaryMinLength',
      type: 'number',
      default: 20,
      label: "Minimum length of summary"
    },
    {
      key: 'summaryMaxLength',
      type: 'number',
      default: 140,
      label: "Maximum length of summary"
    },
    {
      key: 'descriptionMinLength',
      type: 'number',
      default: 140,
      label: "Minimum length of description"
    },
    {
      key: 'descriptionMaxLength',
      type: 'number',
      default: 5000,
      label: "Maximum length of description"
    },
  ],
  feedbackEmail: [
    {
      parentKey: 'ideas',
      key: 'from',
      type: 'string', // todo: add type email/list of emails
      default: '',
      label: "From Address"
    },
    {
      parentKey: 'ideas',
      key: 'subject',
      type: 'string',
      default: '',
      label: 'Subject line'
    },
    {
      parentKey: 'ideas',
      key: 'template',
      type: 'string',
      default: '',
      textarea: true,
      label: 'Template (variables available)'
    },
  ],
  arguments: [

  ],
  newslettersignup: [
    {
      key: 'isActive',
      type: 'boolean',
      default: false,
      label: 'Is active?'
    }
  ],
  votes: [
    {
      key: 'isViewable',
      type: 'boolean',
      default: false,
      label: 'Is the vote count publicly available?'
    },
    {
      key: 'isActive',
      type: 'boolean',
      default: null,
      label: 'Is voting active?'
    },
    /*{
      key: 'isActiveFrom',
      type: 'string',
      default: '',
      label: 'Is voting active?'
    },
    {
      key: 'isActiveTo',
      type: 'string',
      default: '',
    },
    {
      key: 'requiredUserRole',
      type: 'string',
      default: 'member',
      label: 'Is voting active?'
    },*/
    {
      key: 'withExisting',
      type: 'select',
      values: [
        {
          value: 'error',
          label: 'Error',
        },
        {
          value: 'replace',
          label: 'Replace the vote',
        }
      ],
      default: 'error',
      label: 'Should voting again replace previous vote? Or give an error?'
    },
    {
      key: 'voteType',
      type: 'select',
      values: [
        {
          value: 'likes',
          label: 'Likes'
        },
        {
          value: 'count',
          label: 'Count'
        },
        {
          value: 'budgeting',
          label: 'Budgeting'
        }
      ],
      default: 'likes',
      label: 'What type of voting is available?'
    },
    /*{
      key: 'voteValues',
      type: 'arrayOfObjects',
      default: [
        {
          label: 'voor',
          value: 'yes'
        },
        {
          label: 'tegen',
          value: 'no'
        },
      ],
    },*/
    {
      key: 'maxIdeas',
      type: 'number',
      default: 1,
      label: 'What is max amount of ideas users can vote for?'
    },
    {
      key: 'minIdeas',
      type: 'number',
      default: 1,
      label: 'What is min amount of ideas users can vote for?'
    },
    {
      key: 'minBudget',
      type: 'number',
      label: 'What is min budget users can vote for?'
    },
    {
      key: 'maxBudget',
      type: 'number',
      label: 'What is max budget users can vote for?'
    },

  ],
/*  ignoreBruteForce : [

]*/
};
