var allifAssetClassId = 4;  //Long Life Infra
var NoteRefText = "";
$(document).ready(function () {
    $("#viewquestion").hide();
    $("#editquestion").hide();
    $("#questionHome").show();
    $("#lpControlGroup").hide();
    $("#divMetricAndFollowupGroup").hide();

    $("#divLpGroupView").hide();
    $("#divAllifControlGroupView").hide();

});
var assetId = "";
var QuestionId = "";
//Questionnaire settings page
myapp.controller('QuestionnaireCont', function ($scope, $http) {
    //debugger;
    $scope.selectedAssetClassId = null;
    $scope.selectedProcessGroup = null;
    $scope.selectedSectionId = null;
    $scope.selectedSectionPartId = null;
    $scope.ASSETS = [];
    $scope.ProcessGroups = [];
    $scope.GROUPS = [];
    $scope.SectionHeadings = [];
    $scope.SubSectionHeadings = [];
    $scope.SectionPartNumbers = [];
    $scope.AssetId = null;
    $scope.ProcessGroupId = null;
    $scope.LinkQuestionIds = [];
    $scope.QID = null;
    $scope.selectedStatus = 1;
    $scope.selectedMandatory = 1;
    $scope.selectedLpSpecific = 1;
    $scope.selectedLp = 1;
    $scope.SaveClicked = false;
    // DAC TAB
   
    $scope.PopupAddDACAssetClass = function () {
        $scope.GROUPS = null;
        $scope.ASSETS = null;
        $http({
            method: 'GET',
            url: '/Questionnaire/GetAllAssetClassForDAC'
        }).success(function (result) {
            $scope.ASSETS = result;
            $.each(result, function (index) {
                if ($("#AssetClass_Edit option[value=" + result[index].AssetID + "]").length == 0) {
                    $('#AssetClass_Edit').append('<option value="' + result[index].AssetID + '">' + result[index].AssetName + '</option>');
                }
            });
            if ($("#hdnFlag").val() == 'true' && localStorage.getItem('AssetClassId') != "undefined") {
                $scope.selectedAssetClassId = parseInt(localStorage.getItem('AssetClassId'));
            }
        });
    }

    assetId = $scope.selectedAssetClassId;
    $scope.GetQuestionGroup = function () {
        $scope.GROUPS = null;
        $scope.ASSETS = null;
        $http({
            method: 'GET',
            url: '/Questionnaire/GetQuestionGroup'
        }).success(function (result) {
            $scope.ProcessGroups = result;
            $.each(result, function (index) {
                if ($("#ProcessGroup_Edit option[value=" + result[index].ProcessGroupId + "]").length == 0) {
                    $('#ProcessGroup_Edit').append('<option value="' + result[index].ProcessGroupId + '">' + result[index].ProcessGroupName + '</option>');
                }
            });
            if ($("#hdnFlag").val() == 'true' && localStorage.getItem('ProcessGroupId') != "undefined" ) {
                $scope.selectedProcessGroup = parseInt(localStorage.getItem('ProcessGroupId'));
                $scope.GetSectionHeading();
            }
        });
    }

    $scope.GetSectionHeading = function () {
       
        if ($scope.selectedAssetClassId == null) {
            if ($("#hdnFlag").val() == 'true' && localStorage.getItem('AssetClassId') != "undefined") {
                $scope.selectedAssetClassId = parseInt(localStorage.getItem('AssetClassId'));
            }
        }
        var _assetId = $scope.selectedAssetClassId;
        var _processGroupId = $scope.selectedProcessGroup;

        $http.get('/Questionnaire/GetSectionHeading/', { params: { assetId: _assetId, processGroupId: _processGroupId } })
            .success(function (data) {
                $scope.SectionHeadings = data;
            })
            .error(function () {
                $scope.error = "An Error has occured while loading posts!";
            });
        if ($("#hdnFlag").val() == 'true' && localStorage.getItem('SecHeadingId') != "undefined") {
            $scope.selectedSectionId = parseInt(localStorage.getItem('SecHeadingId'));
            $scope.GetSubSectionHeading();
        }
    }

    $scope.GetLinkQuestionId = function (linkedQuesId) {
        var _assetId = $('#AssetClass_Edit').val();
        var _sectionId = $('#selHeading_edit').val();
        var _subSectionId = $('#selSectionHeading_edit').val();
        var _currentQID = $("#hdQuestionId").val();
        $http.get('/Questionnaire/GetLinkQuestionId/', { params: { assetId: _assetId, sectionId: _sectionId, subSectionId: _subSectionId, currentQID: _currentQID } })
            .success(function (result) {
                $scope.LinkQuestionIds = result;
                //$scope.selectedYesLinkQuestionId = linkedQuesId;
                $.each(result, function (index) {
                    if ($("#selYesLinkQuestion_edit option[value=" + result[index].QID + "]").length == 0) {
                        $('#selYesLinkQuestion_edit').append('<option value="' + result[index].QID + '">' + result[index].QusetionNo + '</option>');
                    }
                });

                $('#selYesLinkQuestion_edit').val(linkedQuesId);
            })
            .error(function () {
                $scope.error = "An Error has occured while loading posts!";
            });
    }

    $scope.YesQuestionChangeEdit = function () {
        $scope.selectedYesLinkQuestionId = $("#selYesLinkQuestion_edit").val();
    }

    $scope.GetNoLinkQuestionId = function (linkedQuesId) {
        var _assetId = $('#AssetClass_Edit').val();
        var _sectionId = $('#selHeading_edit').val();
        var _subSectionId = $('#selSectionHeading_edit').val();
        var _currentQID = $("#hdQuestionId").val();
        $http.get('/Questionnaire/GetLinkQuestionId/', { params: { assetId: _assetId, sectionId: _sectionId, subSectionId: _subSectionId, currentQID: _currentQID } })
            .success(function (result) {
                //$scope.LinkQuestionIds = result;
                //$scope.selectedNoLinkQuestionId = linkedQuesId;

                $.each(result, function (index) {
                    if ($("#selNoLinkQuestion_edit option[value=" + result[index].QID + "]").length == 0) {
                        $('#selNoLinkQuestion_edit').append('<option value="' + result[index].QID + '">' + result[index].QusetionNo + '</option>');
                    }
                });

                $('#selNoLinkQuestion_edit').val(linkedQuesId);
            })
            .error(function () {
                $scope.error = "An Error has occured while loading posts!";
            });
    }

    $scope.NoQuestionChangeEdit = function () {
        $scope.selectedYesLinkQuestionId = $("#selNoLinkQuestion_edit").val();
    }


    $scope.GetSubSectionHeading = function () {
        var _sectionId = $scope.selectedSectionId;
        $http.get('/Questionnaire/GetSubSectionHeading/', { params: { sectionId: _sectionId } })
            .success(function (data) {
                $scope.SubSectionHeadings = data;
            })
            .error(function () {
                $scope.error = "An Error has occured while loading posts!";
            });
        if ($("#hdnFlag").val() == 'true' && localStorage.getItem('SubSectionHeadingId') != "undefined") {
            $scope.selectedSectionPartId = parseInt(localStorage.getItem('SubSectionHeadingId'));
            $scope.LoadQuestionData();
        }
    }

    $scope.ResetDropdowns = function () {
        $scope.selectedProcessGroup = "";
        $scope.SectionHeadings = null;
        $scope.SubSectionHeadings = null;
        if ($scope.selectedAssetClassId == allifAssetClassId) {
            //Add
            $("#divMetricAndFollowupGroup").show();
            $("#lpControlGroup").show();

            //Edit
            $("#divAllifControlGroupEdit").show();
            $("#divAllifLpGroupEdit").show();
        }
        else {
            //Add
            $("#divMetricAndFollowupGroup").hide();
            $("#lpControlGroup").hide();
            //Edit
            //Edit
            $("#divAllifControlGroupEdit").hide();
            $("#divAllifLpGroupEdit").hide();
        }
    }

    //Add question
    $scope.AddQuestion = function () {
        localStorage.setItem('AssetClassId', $('#AssetClass').val().split(":")[1]);
        localStorage.setItem('ProcessGroupId', $('#ProcessGroup').val().split(":")[1]);
        localStorage.setItem('SecHeadingId', $('#secHeading').val().split(":")[1]);
        localStorage.setItem('SubSectionHeadingId', $('#subSectionHeading').val().split(":")[1]);
        window.location.pathname = '/Questionnaire/AddQuestion/';
    }

    $scope.AddQuestionForm = function () {
        if ($("#txtAreaQuestionText").val()) {
            var obj = {};
            obj.AssetClassId = $scope.selectedAssetClassId;
            obj.ProcessGroupId = $scope.selectedProcessGroup;
            obj.SectionId = $scope.selectedSectionId;
            obj.SubSectionId = $scope.selectedSectionPartId;
            obj.QuestionGroupId = $scope.selectedQuestionGroupId;
            obj.Status = $scope.selectedStatus;
            obj.Mandatory = $scope.selectedMandatory;
            obj.QuestionText = $("#txtAreaQuestionText").val();
            obj.NoteRefText = $("#txtAreaNoteRef").val();
            obj.ClauseRef = $("#txtClauseRef").val();
            obj.QuestionNo = $("#txtQuestionNo").val();
            if ($scope.selectedAssetClassId == allifAssetClassId) {
                obj.LPSpecific = $scope.selectedLpSpecific;
                obj.LP = $scope.selectedLp;
                obj.Metric = $("#txtAreaMetric").val();
                obj.YesFollowupText = $("#txtAreaYesFolloup").val();
                obj.NoFollowupText = $("#txtAreaNoFolloup").val();
            }
            $scope.SaveClicked = false;
            $http.post('/Questionnaire/AddQuestionDetails', JSON.stringify(obj)).then(function (response) {
                if (response.data > 0) {
                    toastr.success('Question added successfully', 'Success', { timeOut: 5000 })
                    $scope.SaveClicked = true;
                    $scope.Reset();
                }
            });
        } else {
            toastr.error('Question Text is mandatory', 'Error', { timeOut: 5000 })
        }
    }

    $scope.EditQuestionForm = function () {
        if ($("#txtAreaQuestionText_edit").val()) {
            var obj = {};
            obj.QuestionId = $("#hdQuestionId").val();
            obj.AssetClassId = $('#AssetClass_Edit').val(); //$scope.selectedAssetClassId;
            obj.SectionId = $('#selHeading_edit').val();//$scope.selectedSectionId;
            obj.SubSectionId = $('#selSectionHeading_edit').val();//$scope.selectedSectionPartId;
            obj.QuestionGroupId = $('#questionGroup_edit').val();
            obj.Status = $scope.selectedStatus;
            obj.Mandatory = $scope.selectedMandatory;
            obj.QuestionText = $("#txtAreaQuestionText_edit").val();
            obj.NoteRefText = $("#txtAreaNoteRef_edit").val();
            obj.ClauseRef = $("#txtClauseRef_Edit").val();
            obj.QuestionNo = $("#txtQuestionNo_Edit").val();
            if ($('#AssetClass_Edit').val() == allifAssetClassId) {
                obj.LPSpecific = $scope.selectedLpSpecific;
                obj.LP = $scope.selectedLp;
                obj.Metric = $("#txtAreaMetric_edit").val();
                obj.YesFollowupText = $("#txtAreaYesFolloup_edit").val();
                obj.NoFollowupText = $("#txtAreaNoFolloup_edit").val();
                var yesLinkQid = 0;
                if ($('#selYesLinkQuestion_edit').val() != '') {
                    yesLinkQid = $('#selYesLinkQuestion_edit').val();
                }
                var noLinkQid = 0;
                if ($('#selNoLinkQuestion_edit').val() != '') {
                    noLinkQid = $('#selNoLinkQuestion_edit').val();
                }
                obj.YesLinkedQid = yesLinkQid;
                obj.NoLinkedQid = noLinkQid;
            }

            $http.post('/Questionnaire/UpdateQuestionDetails', JSON.stringify(obj)).then(function (response) {

                if (response.data > 0) {
                    toastr.success('Question updated successfully', 'Success', { timeOut: 5000 })
                }
            });
        } else {
            toastr.error('Question Text is mandatory', 'Error', { timeOut: 5000 })
        }
    }

    $scope.Reset = function () {        
        if ($scope.SaveClicked == true) {
            $scope.ClearFieldValues();
        }
        else {
            confirmDialog("Are you sure to Reset?", function () {
                $scope.ClearFieldValues();
            });
        }
    }

    $scope.ClearFieldValues = function () {
        $scope.selectedAssetClassId = null;
        $scope.selectedProcessGroup = null;
        $scope.selectedSectionId = null;
        $scope.selectedSectionPartId = null;
        $scope.selectedQuestionGroupId = null;
        $("#txtAreaQuestionText").summernote("code", "");
        $("#txtAreaNoteRef").summernote("code", "");
        $("#txtClauseRef").val("");
        $("#txtAreaMetric").summernote("code", "");
        $("#txtAreaYesFolloup").summernote("code", "");
        $("#txtAreaNoFolloup").summernote("code", "");
        $scope.selectedStatus = 1;
        $scope.selectedMandatory = 1;
        $scope.selectedLpSpecific = 1;
        $scope.selectedLp = 1;
        $("#divMetricAndFollowupGroup").hide();
        $("#lpControlGroup").hide();
        $("#txtQuestionNo").val("");
     }

    $scope.ResetEdit = function () {
        confirmDialog("Are you sure to Reset?", function () {
            $scope.selectedStatus = 1;
            $scope.selectedMandatory = 1;
            $scope.selectedLpSpecific = 1;
            $scope.selectedLp = 1;
            $('#questionGroup_edit').val("");
            $("#txtQuestionNo_Edit").val("");
            $("#txtAreaQuestionText_edit").summernote("code", "");
            $("#txtAreaMetric_edit").summernote("code", "");
            $("#txtAreaYesFolloup_edit").summernote("code", "");
            $("#txtAreaNoFolloup_edit").summernote("code", "");
            $("#txtAreaNoteRef_edit").summernote("code", "");
            $("#txtClauseRef_Edit").val("");
            $('#selYesLinkQuestion_edit').val("");
            $('#selNoLinkQuestion_edit').val("");
        });
    }


    $scope.LoadQuestionData = function () {
        var table = $("#questionnaires-table").DataTable({
            destroy: true,
            "order": [[4, "desc"]],
            "processing": true,
            "ajax": {
                "url": '/Questionnaire/GetQuestionList',
                "type": "GET",
                "datatype": "json",
                "data": {
                    assetId: $scope.selectedAssetClassId,
                    sectionId: $scope.selectedSectionId,
                    subSectionId: $scope.selectedSectionPartId,
                    processGroupId: $scope.selectedProcessGroup
                }
            },
            "columns": [
                { "data": "QuestionNo", "autowidth": false },
                { "data": "QuestionText", "autowidth": false },
                { "data": "DisplayOrder", "autowidth": false },
                { "data": "Status", "autowidth": false },
                { "data": "Mandatory", "autowidth": false },
                { "data": "SubQuestion", "autowidth": false },
                { "data": "ReferenceNote", "autowidth": false },
                {
                    "data": "QID",
                    'render': function (QID) {
                        return '<a style="cursor:pointer" onclick="GetEditQuestionData(\'' + QID + '\')"><i class="fa fa-fw fa-edit"></i></a>'
                    },
                },
                {
                    "data": "QID",
                    'render': function (QID) {
                        return '<a style="cursor:pointer" onclick="GetViewQuestionData(\'' + QID + '\')"><i class="fa fa-fw fa-eye"></i></a>'
                    },
                }
            ]
        });
    }

    if ($("#hdnFlag").val() == 'false') {
        localStorage.removeItem('AssetClassId');
        localStorage.removeItem('ProcessGroupId');
        localStorage.removeItem('SecHeadingId');
        localStorage.removeItem('SubSectionHeadingId');
    }

    $scope.RedirectToHomePage = function () {
        confirmDialog("Are you sure to Cancel?", function () {
            window.location = '/Questionnaire/Index?isFromAddEdit=true';
        });
    }
});

function confirmDialog(message, onConfirm) {
    var fClose = function () {
        modal.modal("hide");
    };
    var modal = $("#confirmModal");
    modal.modal("show");
    $("#confirmMessage").empty().append(message);
    $("#confirmOk").unbind().one('click', onConfirm).one('click', fClose);
    $("#confirmCancel").unbind().one("click", fClose);
}

function GetEditQuestionData(QuestionId) {
    localStorage.setItem('AssetClassId', $('#AssetClass').val().split(":")[1]);
    localStorage.setItem('ProcessGroupId', $('#ProcessGroup').val().split(":")[1]);
    localStorage.setItem('SecHeadingId', $('#secHeading').val().split(":")[1]);
    localStorage.setItem('SubSectionHeadingId', $('#subSectionHeading').val().split(":")[1]);
    $("#hdQuestionId").val(QuestionId);
    $("#editquestion").show();
    $("#viewquestion").hide();
    $("#questionHome").hide();
    $.ajax({
        url: "/Questionnaire/GetQuestionDetailsByQuestionId",
        type: "GET",
        data: { questionId: QuestionId },
        dataType: "json"
    }).success(function (resp) {
        $('#AssetClass_Edit').val(resp.AssetClassId);
        $('#ProcessGroup_Edit').val(resp.ProcessGroupId);
        $('#questionGroup_edit').val(resp.QuestionGroupId);
        $("#txtQuestionNo_Edit").val(resp.QuestionNo);
        if (resp.Status == "True") {
            $("#statusYes_edit").prop("checked", true);
        }
        else {
            $("#statusNo_edit").prop("checked", true);
        }
        if (resp.Mandatory == "True") {
            $("#mandatoryY_edit").prop("checked", true);
        }
        else {
            $("#mandatoryN_edit").prop("checked", true);
        }

        if (resp.LPSpecific == "0") {
            $("#lpsNo_edit").prop("checked", true);
        }
        else if (resp.LPSpecific == "1") {
            $("#lpsYes_edit").prop("checked", true);
        }
        else {
            $("#lpsNa_edit").prop("checked", true);
        }

        if (resp.LP == "0") {
            $("#lpNo_edit").prop("checked", true);
        }
        else if (resp.LP == "1") {
            $("#lpYes_edit").prop("checked", true);
        }
        else {
            $("#lpNa_edit").prop("checked", true);
        }
        $("#txtAreaQuestionText_edit").summernote("code", resp.QuestionText);
        $("#txtAreaNoFolloup_edit").summernote("code", resp.NoFollowupText);
        $("#txtAreaYesFolloup_edit").summernote("code", resp.YesFollowupText);
        $("#txtAreaMetric_edit").summernote("code", resp.Metric);
        $("#txtAreaNoteRef_edit").summernote("code", resp.NoteRefText);
        $("#txtClauseRef_Edit").val(resp.ClauseRef);
        if ($('#AssetClass_Edit').val() == allifAssetClassId) {
            $("#divAllifLpGroupEdit").show();
            $("#divAllifControlGroupEdit").show();
            $("#divAllifLinkQuestionGroupEdit").show();
            
        } else {
            $("#divAllifLpGroupEdit").hide();
            $("#divAllifControlGroupEdit").hide();
            $("#divAllifLinkQuestionGroupEdit").hide();
        }
        //BindSectionHeadingEdit(resp)

        $('#selHeading_edit').append('<option value="' + resp.SectionId + '">' + resp.SectionHeadingText + '</option>');
        $('#selHeading_edit').val(resp.SectionId);

        $('#selSectionHeading_edit').append('<option value="' + resp.SubSectionId + '">' + resp.SubSectionHeadingText + '</option>');
        $('#selSectionHeading_edit').val(resp.SubSectionId);

        //angular.element(document.getElementById('editquestion')).scope().GetLinkQuestionId(resp.LinkQuestionId);
        //To Get Yes Linked Question ID
        angular.element(document.getElementById('editquestion')).scope().GetLinkQuestionId(resp.YesLinkedQid);
        //To Get No Linked Question ID
        angular.element(document.getElementById('editquestion')).scope().GetNoLinkQuestionId(resp.NoLinkedQid);
    })
}

function BindSectionHeadingEdit(resp) {
    $.ajax({
        url: "/Questionnaire/GetSectionHeading/",
        type: "GET",
        data: { assetId: resp.AssetClassId, processGroupId: resp.ProcessGroupId },
        dataType: "json"
    }).success(function (data) {
        $.each(data, function (index) {
            if ($("#selHeading_edit option[value=" + data[index].QSecID + "]").length == 0) {
                $('#selHeading_edit').append('<option value="' + data[index].QSecID + '">' + data[index].SectionHeading + '</option>');
            }
        })
        $('#selHeading_edit').val(resp.SectionId);
        BindSubSectionHeadingEdit(resp);
    })
}

function BindSubSectionHeadingEdit(resp) {

    $.ajax({
        url: "/Questionnaire/GetSubSectionHeading/",
        type: "GET",
        data: { sectionId: resp.SectionId },
        dataType: "json"
    }).success(function (data) {
        $.each(data, function (index) {
            if ($("#selSectionHeading_edit option[value=" + data[index].SecPartID + "]").length == 0) {
                $('#selSectionHeading_edit').append('<option value="' + data[index].SecPartID + '">' + data[index].SubSecHeadingText + '</option>');
            }
        })
        $('#selSectionHeading_edit').val(resp.SubSectionId);
        //angular.element(document.getElementById('editquestion')).scope().GetLinkQuestionId(resp.LinkQuestionId);
        //To Get Yes Linked Question ID
        angular.element(document.getElementById('editquestion')).scope().GetLinkQuestionId(resp.YesLinkedQid);
        //To Get No Linked Question ID
        angular.element(document.getElementById('editquestion')).scope().GetNoLinkQuestionId(resp.NoLinkedQid);
    })
}

function AssetChangedEdit() {
    $('#ProcessGroup_Edit').val("");

    $('#selHeading_edit').html("");
    $('#selHeading_edit').append('<option value="">Select Section Heading...</option>');
    $('#selHeading_edit').val("");

    $('#selSectionHeading_edit').html("");
    $('#selSectionHeading_edit').append('<option value="">Select Section Sub Heading...</option>');
    $('#selSectionHeading_edit').val("");
}

function ProcessGroupChangedEdit() {
    $.ajax({
        url: "/Questionnaire/GetSectionHeading/",
        type: "GET",
        data: { assetId: $('#AssetClass_Edit').val(), processGroupId: $('#ProcessGroup_Edit').val() },
        dataType: "json"
    }).success(function (data) {
        $('#selHeading_edit').html("");
        $('#selHeading_edit').append('<option value="">Select Section Heading...</option>');
        $.each(data, function (index) {
            if ($("#selHeading_edit option[value=" + data[index].QSecID + "]").length == 0) {
                $('#selHeading_edit').append('<option value="' + data[index].QSecID + '">' + data[index].SectionHeading + '</option>');
            }
        })
        $('#selHeading_edit').val("");
        })
}

function SectionHeadingChangedEdit() {
    if ($('#selHeading_edit').val()) {
        $.ajax({
            url: "/Questionnaire/GetSubSectionHeading/",
            type: "GET",
            data: { sectionId: $('#selHeading_edit').val() },
            dataType: "json"
        }).success(function (data) {
            $('#selSectionHeading_edit').html("");
            $('#selSectionHeading_edit').append('<option value="">Select Section Sub Heading...</option>');
            $.each(data, function (index) {
                if ($("#selSectionHeading_edit option[value=" + data[index].SecPartID + "]").length == 0) {
                    $('#selSectionHeading_edit').append('<option value="' + data[index].SecPartID + '">' + data[index].SubSecHeadingText + '</option>');
                }
            })
            $('#selSectionHeading_edit').val("");
        })
    }
}


function GetViewQuestionData(QuestionId) {
    localStorage.setItem('AssetClassId', $('#AssetClass').val().split(":")[1]);
    localStorage.setItem('ProcessGroupId', $('#ProcessGroup').val().split(":")[1]);
    localStorage.setItem('SecHeadingId', $('#secHeading').val().split(":")[1]);
    localStorage.setItem('SubSectionHeadingId', $('#subSectionHeading').val().split(":")[1]);
    $("#hdQuestionId").val(QuestionId);
    $("#editquestion").hide();
    $("#viewquestion").show();
    $("#questionHome").hide();
    $.ajax({
        url: "/Questionnaire/GetQuestionDetailsByQuestionId",
        type: "GET",
        data: { questionId: QuestionId },
        dataType: "json"
    }).success(function (resp) {
        $("#spanAssetNameView").html(resp.AssetClassName);
        $("#spanSectionHeadingView").html(resp.SectionHeadingText);
        $("#spanSubSectionHeadingView").html(resp.SubSectionHeadingText);
        $("#spanProcessGroupView").html(resp.ProcessGroupName);
        if (resp.QuestionGroupId == "") { resp.QuestionGroupId = 0; }
        $("#txtQuestionNo_View").html(resp.QuestionNo);
        $("#questionGroup_View option[value=" + resp.QuestionGroupId + "]").attr('selected', 'selected');
        if (resp.Status == "True") {
            $("#statusYes_View").prop("checked", true);
        }
        else {
            $("#statusNo_View").prop("checked", true);
        }
        if (resp.Mandatory == "True") {
            $("#mandatoryY_View").prop("checked", true);
        }
        else {
            $("#mandatoryN_View").prop("checked", true);
        }

        if (resp.LPSpecific == "0") {
            $("#lpsNo_View").prop("checked", true);
        }
        else if (resp.LPSpecific == "1") {
            $("#lpsYes_View").prop("checked", true);
        }
        else {
            $("#lpsNa_View").prop("checked", true);
        }

            if (resp.LP == "0") {
                $("#lpYes_View").prop("checked", true);
            }
            else if (resp.LP == "1") {
                $("#lpNo_View").prop("checked", true);
            }
            else {
                $("#lpNa_View").prop("checked", true);
            }
            
            $("#txtAreaQuestionText_View").html(resp.QuestionText);

        $("#txtAreaYesFolloup_View").html(resp.YesFollowupText);
        $("#txtAreaNoFolloup_View").html(resp.NoFollowupText);
        $("#txtYesLinkedId_View").html(resp.YesLinkedQuestionActionNumber);
        $("#txtNoLinkedId_View").html(resp.NoLinkedQuestionActionNumber);
        
        $("#txtAreaMetric_edit").html(resp.Metric);

        $("#txtAreaNoteRef_View").html(resp.NoteRefText);
        $("#txtClauseRef_View").html(resp.ClauseRef);

        if (resp.AssetClassId == allifAssetClassId) {
            $("#divLpGroupView").show();
            $("#divAllifControlGroupView").show();
        }
        else {
            $("#divLpGroupView").hide();
            $("#divAllifControlGroupView").hide();
        }
    })
}
