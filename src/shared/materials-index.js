export const materialIndex = {
  generatedAt: null,
  source: "nush-materials",
  documents: [],
  skillLinks: {}
};

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function materialContextForSkills(skillIds = [], topicId = null, limit = 4) {
  const wantedSkills = new Set(skillIds.filter(Boolean));
  const linkedDocumentIds = unique(
    skillIds.flatMap((skillId) => materialIndex.skillLinks?.[skillId] ?? [])
  );
  const linkedDocuments = linkedDocumentIds
    .map((id) => materialIndex.documents.find((document) => document.id === id))
    .filter(Boolean);
  const fallbackDocuments = materialIndex.documents.filter((document) => {
    if (topicId && document.topicIds?.length && !document.topicIds.includes(topicId)) {
      return false;
    }
    return document.skillIds?.some((skillId) => wantedSkills.has(skillId));
  });
  const documents = unique([...linkedDocuments, ...fallbackDocuments].map((document) => document.id))
    .map((id) => materialIndex.documents.find((document) => document.id === id))
    .filter(Boolean)
    .slice(0, limit);

  if (!documents.length) {
    return "";
  }

  return documents
    .map((document) => {
      const concepts = (document.keyConcepts ?? []).slice(0, 8).join("; ");
      const questionTypes = (document.questionTypes ?? []).slice(0, 5).join("; ");
      return [
        `Document: ${document.title}`,
        document.summary ? `Summary: ${document.summary}` : "",
        concepts ? `Key concepts: ${concepts}` : "",
        questionTypes ? `Question types: ${questionTypes}` : ""
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
}
