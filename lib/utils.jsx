export function isRelevantThread(participants) {
  if (!participants) {
    return false;
  }
  const githubDomainRegex = /@github\.com/gi;
  return participants.some(contact => githubDomainRegex.test(contact.email));
}

export function findGitHubLink(msg) {
  if (!msg.body) {
    return null;
  }

  // Use a regex to parse the message body for GitHub URLs - this is a quick
  // and dirty method to determine the GitHub object the email is about:
  // https://regex101.com/r/aW8bI4/2
  const re = /<a.*?href=['"](.*?)['"].*?view.*?it.*?on.*?github.*?\/a>/gmi;
  const firstMatch = re.exec(msg.body);
  if (firstMatch) {
    // [0] is the full match and [1] is the matching group
    return firstMatch[1];
  }

  return null;
}

export function parseLink(link) {
  if (!link) {
    return null;
  }
  let matchPull = /^https\:\/\/github\.com\/([^\/]+)\/([^\/]+)\/pull\/([^\/]+)/.exec(link);
  let matchIssue = /^https\:\/\/github\.com\/([^\/]+)\/([^\/]+)\/issues\/([^\/]+)/.exec(link);
  if (matchPull) {
    return {
      type: 'pull-request',
      owner: matchPull[1],
      repo: matchPull[2],
      number: matchPull[3],
    };
  }
  if (matchIssue) {
    return {
      type: 'issue',
      owner: matchIssue[1],
      repo: matchIssue[2],
      number: matchIssue[3],
    };
  }
  return null;
}
