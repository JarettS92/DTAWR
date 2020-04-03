//changes activeTab, should clear env variables later
function changeTab(name){
    document.getElementById('HomeTab').classList.remove("is-current");
    document.getElementById('RootCauseAnalysisTab').classList.remove("is-current");
    document.getElementById('ProblemTrendingTab').classList.remove("is-current");
    document.getElementById('TagDuplicatorTab').classList.remove("is-current");
    document.getElementById('BusinessHourKPIsTab').classList.remove("is-current");
    document.getElementById('StarterTagsTab').classList.remove("is-current");
    document.getElementById('RTaggedTab').classList.remove("is-current");

    document.getElementById(name + "Tab").classList.add("is-current");

    document.getElementById('Home').style.display = "none";
    document.getElementById('RootCauseAnalysis').style.display = "none";
    document.getElementById('ProblemTrending').style.display = "none";
    document.getElementById('TagDuplicator').style.display = "none";
    document.getElementById('BusinessHourKPIs').style.display = "none";
    document.getElementById('StarterTags').style.display = "none";
    document.getElementById('RTagged').style.display = "none";

    document.getElementById(name).style.display = "block";
}