 const ContractType = {
	COMPREHENSIVE : "comprehensive",
	THIRD_PARTY : "thirdParty",
	STANDALONE : "standalone",
	ANOTHER : "another"
}

 const EmailStatus = {
	NOT_SEND: "notSend",
	SENT: "sent",
    TAKE_ISSUE: "takeIssue",
}

 const ContractStatus = {
	ACTIVE: "active",
	PENDING: "pending",
	EXPIRE: "expire",
}

module.exports = {ContractStatus,EmailStatus,ContractType}