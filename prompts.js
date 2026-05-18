export default {
  title:
    "change the case of the title to 'sentence case' so that only 1. proper nouns and 2. the first word after a colon starts with uppercase letters. omit any explainer text. return only the title.",
  intro:
    "output a 50-word summary of the article contents. return only the summary text.",
  sdg: "output a list of all UN SDGs that are mentioned in the article including their number and title. return only the list of SDGs with no explainer text. If no specific SDGs are mentioned, return the closest match to the article topic. output a maximum of 5 items",
  theme:
    "output a list of all themes from this list that are mentioned in the article: [Gender, Sport and refugees, Youth development, Disability, Health, Peacebuilding, Child protection, Economic development, Policy, Democracy, Disaster response, Environment and sustainable development, Not applicable, All topics, Other]. output a maximum of 5 items",
  targetGroup:
    "output a list of all potential target groups that are mentioned in the article from this list: [Not applicable, All target groups, Academics, Adults, Athletes, Children, Displaced people, Girls and women, LGBTQI+, People with disabilities, Policymakers, Practitioners, Seniors, Volunteers, Youth, Other]. output a maximum of 5 items",
  sport:
    "output a list of all sports that are mentioned in the article. including physical activities such as walking, dancing and esports in the list of candidates to output. return only the list of sports with no explainer text. If no specific sports are mentioned, return 'All sports'. output a maximum of 5 items",
  country:
    "output a list of all countries that are mentioned in the article. return only the list of countries with no explainer text. output a maximum of 5 items",
  body: "output the body of the article in clean html. convert all headings to sentence case",
  socialShort:
    "output a 50-word summary of the text in the article. return only the text, with no explainer text.",
  socialLong:
    "output a 150-word summary of the text in the article. return only the text, with no explainer text.",
};
