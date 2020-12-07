

myapp.controller('DACListByAccess', function ($scope, $http) {

    $scope.GetAllDACByAccess = function () {
        $http({
            method: 'GET',
            url: '/DACWorkFlow/GetAllDACByAccess'
        }).success(function (result) {
            $scope.DACFormsList = result
        });
    }

    $scope.GetDACListByAccess = function () {
        $http({
            method: 'GET',
            url: '/DACWorkFlow/GetDACListByAccess'
        }).success(function (result) {
            $scope.DACFormsList = result
        });
    }

    $scope.DACStatusList = function (FormID) {
        localStorage.setItem('DACFormID', FormID);
        window.location.pathname = '/DAC/DACReadOnly/';
    }


    $scope.GetDACStatusByUser = function (DACFormID) {
        $http({
            method: 'GET',
            url: '/DACWorkFlow/GetDACStatusByUser'
        }).success(function (result) {
            $scope.DACStatusList = result
        });
    }

    $scope.OpenQuestionnaire = function (QSecID) {
        window.location.pathname = '/DACWorkFlow/DACQuestionnaire/' + QSecID;
    }
});

myapp.controller('DACQuestionnaire', function ($scope, $http) {

    $scope.GetQuestionnaire = function () {
        $http({
            method: 'GET',
            url: '/DACWorkFlow/GetQuestionnaire'
        }).success(function (result) {
            $scope.MyDACQuestionnaire = result
        });
    }

});

myapp.controller('MyDACStatus', function ($scope, $http) {

    $scope.DACFormNumber = "Please Wait...";
    $scope.UploadedBy = "Please wait";
    $scope.CreatedDate = "Please wait";
    $scope.AssetName = "Please wait";
    $scope.DealNames = "Please wait";
    $scope.ActisFund = "Please wait";
    $scope.NewOrFollowup = "Please wait";
    $scope.DealSize = "Please wait";
    $scope.CurrentInvestment = "Please wait";
    $scope.AmountAlreadyFunded = "Please wait";
    $scope.txtRemarks = "Please wait";

    $scope.DACStatusList = function (FormID) {

        localStorage.setItem('DACFormID', FormID);
        window.location.pathname = '/DAC/DACStatus/';
    }

    $scope.MyDACStatus = function (FormID) {
        localStorage.setItem('DACFormID', FormID);
        window.location.pathname = '/DAC/MyDACStatus/';
    }

    $scope.GetDACListByUserID = function () {
        $http({
            method: 'GET',
            url: '/DACWorkFlow/GetDACListByAccess'
        }).success(function (result) {
            $scope.MyDACList = result
        });
    }

    $scope.GetMyDACInfo = function () {
        $http({
            method: 'GET',
            url: '/DAC/GetDACInfoByDACFormID/' + DACFormID
        }).success(function (result) {
            for (var i = 0; i < result.length; i++) {
                $scope.DACFormNumber = result[i].DACFormNumber;
                $scope.UploadedBy = result[i].USER_NAME;
                $scope.CreatedDate = result[i].CreatedDate;
                $scope.AssetName = result[i].AssetName;
                $scope.DealNames = result[i].DealName;
                $scope.ActisFund = result[i].FundName;
                $scope.NewOrFollowup = result[i].NewInvestOrFollowUp;
                $scope.DealSize = result[i].DealSize;
                $scope.CurrentInvestment = result[i].CurrentInvestment;
                $scope.AmountAlreadyFunded = result[i].AmountAlreadyFunded;
                $scope.txtRemarks = result[i].Remarks;
            }
        });

        $http({
            method: 'GET',
            url: '/DAC/GetDACHistory/' + DACFormID
        }).success(function (result) {
            $scope.MyDACStatusList = result
        });
    }

});

myapp.controller('AttemptPreIC', function ($scope, $http) {
    var _DACFormID = localStorage.getItem('DACFormID_PreIC');
    var _QSecID = localStorage.getItem('QSecID_PreIC');
    var _SecPartID = localStorage.getItem('SecPartID');
    $scope.RespSaveStatus = false;
    $scope.isDisabled = true;
    $scope.isPageIncremented = false;
    //ALLIF
    $scope.$isDisabledLinked = true;
    $scope.isSubmitLinkedDisabled = false;
    //end
    $scope.isSubmitDisabled = false;
    $scope.ProcessGroupID = localStorage.getItem('ProcessGroupID_PreIC');
    $scope.QuestionGroupID = 0;
    $scope.CurrentQuestion = 0
    $scope.AttributeValuesArray = [];
    $scope.FollowupText = null;
    $scope.AllifAssetName = '';
    $scope.IsPreviousButtonClicked = false;
    //Linked Question 
    $scope.LinkedQuestionValueArray = [];
    //$scope.QuestionQroupLinkedQuestionValueArray = [];
    $scope.LinkQIDs = "";
    //End
    console.log('controller - b4 - IsPage incremen ' + $scope.isPageIncremented + ' Total Questions ' + $scope.TotalQuestions + ' Current Questions ' + $scope.CurrentQuestion)
    $scope.GetWelcomeScreenData = function () {
        $http({
            method: 'GET',
            url: '/DACWorkFlow/GetWelcomeScreenData/' + _DACFormID + '/' + _QSecID + '/' + $scope.ProcessGroupID
        }).success(function (result) {
            $scope.WelcomeData = result

            angular.forEach($scope.WelcomeData, function (value, index) {
                $scope.SectionHeading = value.SectionHeading
            })
        });
    }

    $scope.StartQuestionnaire = function (SecPartID) {
        window.location.pathname = '/DACWorkFlow/AttemptPreIC/';
        localStorage.setItem('SecPartID', SecPartID);
        UpdateAttempt(SecPartID, _DACFormID);
    }

    $scope.GetPreICQuestions = function (QgroupID) {
        $scope.CurrentQuestion = QgroupID
        $scope.QuestionGroupID = QgroupID
        $scope.QuestionsList = "";
        $scope.QuestionHeading = "";
        $scope.AttributeValuesArray = [];
        $scope.IsLinkedQuestionExist = false;

        //Allif
        $scope.AllifAssetName = '';
        $scope.AllifAssetName = localStorage.getItem('AllifAssetName');
        if ($scope.AllifAssetName.toUpperCase() == $("#allifClass").val().toUpperCase()) {
            $scope.showFields = true;
        } else {
            $scope.showFields = false;
        }
        //$scope.QuestionQroupLinkedQuestionValueArray.push({ keyQuestionGroupId: $scope.LinkQIDs });
        //set Question Qroup linked QIDS, to get when user click on Previous page
        localStorage.setItem($scope.QuestionGroupID, $scope.LinkQIDs);
        //end
        var _SecPartID = localStorage.getItem('SecPartID');
        $http({
            method: 'GET',
            //url: '/DACWorkFlow/GetPreICQuestions/' + _SecPartID + '/' + $scope.QuestionGroupID + '/' + _DACFormID + '/' + _QSecID + '/' + $scope.ProcessGroupID
            url: '/DACWorkFlow/GetPreICQuestions/' + _SecPartID + '/' + $scope.QuestionGroupID + '/' + _DACFormID + '/' + _QSecID + '/' + $scope.ProcessGroupID + '/' + $scope.LinkQIDs
        }).success(function (result) {
            $scope.QuestionsList = result
            localStorage.setItem('QuestionList', JSON.stringify(result));
            angular.forEach($scope.QuestionsList, function (value, index) {
                if (value.IsQuestionHeading == true) {
                    $scope.QuestionHeading = value.QuestionText
                    $scope.TotalQuestions = value.TotalQuestions
                }
                else {
                    $scope.TotalQuestions = value.TotalQuestions
                }
            })
            console.log('Pre-IC - ' + $scope.TotalQuestions)
            //[ITC Infotech - Start] Allif - add one extra Dummy QuestionGroupId
            if ($scope.AllifAssetName.toUpperCase() == $("#allifClass").val().toUpperCase()) {
                if (QgroupID == 1) {
                    $scope.TotalQuestions = 1;
                }
            }
            //[ITC Infotech - End]
            //$scope.QuestionGroupID = $scope.QuestionGroupID + 1;
            ApplyProgress($scope.TotalQuestions, $scope.CurrentQuestion)
            $scope.GetReferenceNote(_QSecID, _SecPartID, QgroupID)
        });
    }

    $scope.NextQuestions = function () {
        var _QuestionGroupID = 0;
        var _DummyQuestionGroupID = 0;
        var IsLastPage = false;
        $scope.isPageIncremented = false;
        angular.forEach($scope.QuestionsList, function (value, index) {
            if ($scope.QuestionsList[index].IsQuestionHeading == false) {
                var _QID = $scope.QuestionsList[index].QID;

                if (document.getElementById('Yes_' + _QID).checked) {
                    rate_value = document.getElementById('Yes_' + _QID).value;
                    $scope.AttributeValuesArray.push({ 'QID': _QID, 'ControlValue': rate_value, 'ControlType': 'radiobtn' });

                    //Allif
                    //Get Linked Question IDs
                    var ItemExists = false;
                    var LinkQuestionId = value.YesLinkQuestionId;
                    //alert('yes ' + LinkQuestionId);
                    if (LinkQuestionId != null && LinkQuestionId != '') {
                        //check already that question is linked
                        for (i = 0; i < $scope.LinkedQuestionValueArray.length; i++) {
                            if ($scope.LinkedQuestionValueArray[i].LinkQid == LinkQuestionId) {
                                ItemExists = true;
                            }
                        }
                        //Link Question ID to hold
                        if (ItemExists == false) {
                            $scope.LinkedQuestionValueArray.push({ 'LinkQid': LinkQuestionId });
                        }
                    }

                }

                if (document.getElementById('No_' + _QID).checked) {
                    rate_value = document.getElementById('No_' + _QID).value;
                    $scope.AttributeValuesArray.push({ 'QID': _QID, 'ControlValue': rate_value, 'ControlType': 'radiobtn' });

                    //Allif
                    //Get Linked Question IDs
                    var ItemExists = false;
                    var LinkQuestionId = value.NoLinkQuestionId;

                    if (LinkQuestionId != null && LinkQuestionId != '') {
                        //check already that question is linked
                        for (i = 0; i < $scope.LinkedQuestionValueArray.length; i++) {
                            if ($scope.LinkedQuestionValueArray[i].LinkQid == LinkQuestionId) {
                                ItemExists = true;
                            }
                        }
                        //Link Question ID to hold
                        if (ItemExists == false) {
                            $scope.LinkedQuestionValueArray.push({ 'LinkQid': LinkQuestionId });
                        }
                    }

                }

                //if (document.getElementById('NA_' + _QID).checked) {
                //    rate_value = document.getElementById('NA_' + _QID).value;
                //    $scope.AttributeValuesArray.push({ 'QID': _QID, 'ControlValue': rate_value, 'ControlType': 'radiobtn' })
                //}

                console.log('$scope.LinkedQuestionValueArray ' + $scope.LinkedQuestionValueArray);
                var Comments = document.getElementById(_QID).value;
                $scope.AttributeValuesArray.push({ 'QID': _QID, 'ControlValue': Comments, 'ControlType': 'textarea' });

                $scope.AllifAssetName = localStorage.getItem('AllifAssetName');
                if ($scope.AllifAssetName.toUpperCase() == $("#allifClass").val().toUpperCase()) {
                    //Reset QuestionGroup Id in last page
                    //alert("total and current " + $scope.TotalQuestions + ' => ' + $scope.CurrentQuestion);
                    if (($scope.TotalQuestions - 1) == $scope.CurrentQuestion) {
                        IsLastPage = true;
                    }

                    if (document.getElementById('hdMetric_' + _QID).value != '') {
                        if (document.getElementById('Metric_Yes_' + _QID).checked) {
                            rate_value = document.getElementById('Metric_Yes_' + _QID).value;
                            $scope.AttributeValuesArray.push({ 'QID': _QID, 'MetricControlValue': rate_value, 'MetricControlType': 'radiobtn' })
                        }

                        if (document.getElementById('Metric_No_' + _QID).checked) {
                            rate_value = document.getElementById('Metric_No_' + _QID).value;
                            $scope.AttributeValuesArray.push({ 'QID': _QID, 'MetricControlValue': rate_value, 'MetricControlType': 'radiobtn' })
                        }

                        //if (document.getElementById('Metric_NA_' + _QID).checked) {
                        //    rate_value = document.getElementById('Metric_NA_' + _QID).value;
                        //    $scope.AttributeValuesArray.push({ 'QID': _QID, 'MetricControlValue': rate_value, 'MetricControlType': 'radiobtn' })
                        //}
                    }
                    else {
                        $scope.AttributeValuesArray.push({ 'QID': _QID, 'MetricControlValue': '', 'MetricControlType': 'radiobtn' })
                    }

                    if (document.getElementById('hdMetric_' + _QID).value != '') {
                        Comments = document.getElementById('Metric_Comment_' + _QID).value;
                        $scope.AttributeValuesArray.push({ 'QID': _QID, 'MetricControlValue': Comments, 'MetricControlType': 'textarea' })
                    }
                    else {
                        $scope.AttributeValuesArray.push({ 'QID': _QID, 'MetricControlValue': '', 'MetricControlType': 'textarea' })
                    }
                }
                //End
            }
        });

        var FormAttributeValues = JSON.stringify($scope.AttributeValuesArray);
        var _SecPartID = localStorage.getItem('SecPartID');
        SaveResponse(_DACFormID, _QSecID, $scope.ProcessGroupID, FormAttributeValues);
        console.log($scope.AttributeValuesArray);
        $scope.QuestionsList = "";
        $scope.QuestionHeading = "";
        console.log('Next Question - b4 - Total Questions ' + $scope.TotalQuestions + ' Current Questions ' + $scope.CurrentQuestion)
        $scope.CurrentQuestion = $scope.CurrentQuestion + 1;
        $scope.QuestionGroupID = $scope.QuestionGroupID + 1;
        _QuestionGroupID = $scope.QuestionGroupID;
        console.log('Next Question - after - Total Questions ' + $scope.TotalQuestions + ' Current Questions ' + $scope.CurrentQuestion)
        //if last page, use dummy page to 
        if (IsLastPage) {
            //alert(LinkQuestionValueArrayObject.length);
            //if (LinkQuestionValueArrayObject.length > 0) {
            //pass as 0
            _QuestionGroupID = _DummyQuestionGroupID;
            //}
            //else {
            //    $scope.TotalQuestions = value.TotalQuestions - 1;
            //}
        }
        //Linked Questions
        $scope.LinkQIDs = "";
        var LinkQuestionValueArrayObject = $scope.LinkedQuestionValueArray;
        for (i = 0; i < LinkQuestionValueArrayObject.length; i++) {
            $scope.LinkQIDs = $scope.LinkQIDs + LinkQuestionValueArrayObject[i].LinkQid + ','
        }

        //set Question Qroup linked QIDS, to get when user click on Previous page
        localStorage.setItem($scope.QuestionGroupID, $scope.LinkQIDs);
        var linkQIDs = $scope.LinkQIDs;
        //Clear when user navigate to next page
        $scope.LinkQIDs = "";
        //end
        $http({
            method: 'GET',
            //url: '/DACWorkFlow/GetPreICQuestions/' + _SecPartID + '/' + $scope.QuestionGroupID + '/' + _DACFormID + '/' + _QSecID + '/' + $scope.ProcessGroupID
            url: '/DACWorkFlow/GetPreICQuestions/' + _SecPartID + '/' + _QuestionGroupID + '/' + _DACFormID + '/' + _QSecID + '/' + $scope.ProcessGroupID + '/' + linkQIDs
        }).success(function (result) {
            $scope.QuestionsList = result

            angular.forEach($scope.QuestionsList, function (value, index) {
                if (value.IsQuestionHeading == true) {
                    $scope.QuestionHeading = value.QuestionText
                }
            })
            //$scope.QuestionGroupID = $scope.QuestionGroupID + 1;
            ApplyProgress($scope.TotalQuestions, $scope.CurrentQuestion)
            $scope.GetReferenceNote(_QSecID, _SecPartID, _QuestionGroupID)
            //Clear link question value array once it's populated
            $scope.LinkedQuestionValueArray = [];
            //end
        });

        $scope.AttributeValuesArray = [];

    }

    //Question attempt - save
    $scope.SaveAnswers = function () {
        $scope.isDisabled = true;
        $scope.ShowLoading = true;
        $scope.AttributeValuesArray = [];
        angular.forEach($scope.QuestionsList, function (value, index) {
            if ($scope.QuestionsList[index].IsQuestionHeading == false) {
                var _QID = $scope.QuestionsList[index].QID;
                var _Linked_Yes_QID = $scope.QuestionsList[index].YesLinkQuestionId;
                var _Linked_No_QID = $scope.QuestionsList[index].NoLinkQuestionId;

                if (document.getElementById('Yes_' + _QID).checked) {
                    rate_value = document.getElementById('Yes_' + _QID).value;
                    $scope.AttributeValuesArray.push({ 'QID': _QID, 'ControlValue': rate_value, 'ControlType': 'radiobtn' })
                }

                if (document.getElementById('No_' + _QID).checked) {
                    rate_value = document.getElementById('No_' + _QID).value;
                    $scope.AttributeValuesArray.push({ 'QID': _QID, 'ControlValue': rate_value, 'ControlType': 'radiobtn' })
                }

                //if (document.getElementById('NA_' + _QID).checked) {
                //    rate_value = document.getElementById('NA_' + _QID).value;
                //    $scope.AttributeValuesArray.push({ 'QID': _QID, 'ControlValue': rate_value, 'ControlType': 'radiobtn' })
                //}

                var Comments = document.getElementById(_QID).value;
                $scope.AttributeValuesArray.push({ 'QID': _QID, 'ControlValue': Comments, 'ControlType': 'textarea' })

                //Allif
                $scope.AllifAssetName = localStorage.getItem('AllifAssetName');
                if ($scope.AllifAssetName.toUpperCase() == $("#allifClass").val().toUpperCase()) {
                    if (document.getElementById('hdMetric_' + _QID).value != '') {
                        if (document.getElementById('Metric_Yes_' + _QID).checked) {
                            rate_value = document.getElementById('Metric_Yes_' + _QID).value;
                            $scope.AttributeValuesArray.push({ 'QID': _QID, 'MetricControlValue': rate_value, 'MetricControlType': 'radiobtn' })
                        }

                        if (document.getElementById('Metric_No_' + _QID).checked) {
                            rate_value = document.getElementById('Metric_No_' + _QID).value;
                            $scope.AttributeValuesArray.push({ 'QID': _QID, 'MetricControlValue': rate_value, 'MetricControlType': 'radiobtn' })
                        }

                        //if (document.getElementById('Metric_NA_' + _QID).checked) {
                        //    rate_value = document.getElementById('Metric_NA_' + _QID).value;
                        //    $scope.AttributeValuesArray.push({ 'QID': _QID, 'MetricControlValue': rate_value, 'MetricControlType': 'radiobtn' })
                        //}
                    }
                    else {
                        $scope.AttributeValuesArray.push({ 'QID': _QID, 'MetricControlValue': '', 'MetricControlType': 'radiobtn' })
                    }

                    var Comments = '';

                    if (document.getElementById('hdMetric_' + _QID).value != '') {
                        Comments = document.getElementById('Metric_Comment_' + _QID).value;
                    }
                    $scope.AttributeValuesArray.push({ 'QID': _QID, 'MetricControlValue': Comments, 'MetricControlType': 'textarea' })
                }
                //end
            }
        });

        var FormAttributeValues = JSON.stringify($scope.AttributeValuesArray);
        SaveResponse(_DACFormID, _QSecID, $scope.ProcessGroupID, FormAttributeValues);
        $scope.AttributeValuesArray = [];
        $scope.ReviewBtnVissible = true;
    }


    $scope.ReviewAnswers = function () {
        window.location.pathname = '/DACWorkFlow/ReviewAnswers/';
    }

    $scope.PreviousQuestions = function () {

        $scope.AttributeValuesArray = [];
        var _SecPartID = localStorage.getItem('SecPartID');
        var _QuestionGroupID = $scope.QuestionGroupID - 1;

        //Allif - linked
        var linkedQIDs = localStorage.getItem(($scope.QuestionGroupID - 1));
        if (linkedQIDs == null)
            linkedQIDs = "";
        //why -2 exising code/logic
        //end
        $http({
            method: 'GET',
            //url: '/DACWorkFlow/GetPreICQuestions/' + _SecPartID + '/' + ($scope.QuestionGroupID - 2) + '/' + _DACFormID + '/' + _QSecID + '/' + $scope.ProcessGroupID
            url: '/DACWorkFlow/GetPreICQuestions/' + _SecPartID + '/' + _QuestionGroupID + '/' + _DACFormID + '/' + _QSecID + '/' + $scope.ProcessGroupID + '/' + linkedQIDs
        }).success(function (result) {
            $scope.QuestionsList = "";
            $scope.QuestionHeading = "";
            $scope.QuestionsList = result
            console.log('Previous Question - b4 - Total Questions ' + $scope.TotalQuestions + ' Current Questions ' + $scope.CurrentQuestions)
            $scope.CurrentQuestion = $scope.CurrentQuestion - 1;
            $scope.QuestionGroupID = $scope.QuestionGroupID - 1;

            //Decrease the total questions when previous button is clicked.
            if ($scope.TotalQuestions > 1) {
                $scope.TotalQuestions = $scope.TotalQuestions - 1;
            }
            console.log('Previous Question - after - Total Questions ' + $scope.TotalQuestions + ' Current Questions ' + $scope.CurrentQuestions)
            angular.forEach($scope.QuestionsList, function (value, index) {
                if (value.IsQuestionHeading == true) {
                    $scope.QuestionHeading = value.QuestionText;
                }
            })

            ApplyProgress($scope.TotalQuestions, $scope.CurrentQuestion)
            $scope.GetReferenceNote(_QSecID, _SecPartID, $scope.CurrentQuestion)
        });
    }


    $scope.GetReferenceNote = function (_QSecID, _SecPartID, _QuestionGroupID) {

        $http({
            method: 'GET',
            url: '/DACWorkFlow/GetReferenceNote/' + _QSecID + '/' + _SecPartID + '/' + _QuestionGroupID
        }).success(function (result) {
            $scope.ReferenceItemsList = result
        });
    }

    function ApplyProgress(TotalQuestions, CurrentQuestions) {

        //$scope.SubmitBtnVissible = false
        $scope.ReviewBtnVissible = false
        $scope.ReviewBtnVissible = false
        $scope.PreviousIsDisabled = false;
        $scope.NextIsDisabled = false;
        $scope.SaveIsEnable = true;
        $scope.Percentage = 0;
        if (isNaN(TotalQuestions) || isNaN(CurrentQuestions)) {
            $scope.Percentage = 0;
        } else {
            $scope.Percentage = ((CurrentQuestions / TotalQuestions) * 100).toFixed(3);
        }

        $scope.PercentageObj = {
            "width": $scope.Percentage + '%'
        }

        $scope.RoundPercentage = $scope.Percentage - ($scope.Percentage % 1);
        if (TotalQuestions == CurrentQuestions) {
            $scope.SubmitBtnVissible = true
            $scope.NextIsDisabled = true;
            $scope.isDisabled = false;
            //$scope.SubmitBtnVissible = false;
            $scope.ReviewBtnVissible = false;
            $scope.SaveIsEnable = false;
        }

        //disable save button if not reached end
        console.log($scope.RoundPercentage)
        if ($scope.RoundPercentage < 100) {
            $scope.isDisabled = true;
        }
        if (CurrentQuestions == 1) {
            $scope.PreviousIsDisabled = true;
        }

        console.log('Apply percentage - Total Questions ' + TotalQuestions + ' Current Questions ' + CurrentQuestions)
    }

    function SaveResponse(DACFormID, QSecID, ProcessGroupID, FormAttributeValues) {
        $http({
            method: 'POST',
            url: '/DACWorkFlow/UpdateResponse/',
            data: { DACFormID: DACFormID, QSecID: QSecID, ProcessGroupID: ProcessGroupID, FormAttributeValues: FormAttributeValues }
        }).then(function (result) {
            if (result.data == 'True') {
                $scope.ShowLoading = false;
            }
            else {

            }
        });
    }

    function UpdateAttempt(_SecPartID, _DACFormID) {
        $http({
            method: 'POST',
            url: '/DACWorkFlow/UpdateAttempt/',
            data: { SecPartID: _SecPartID, DACFormID: _DACFormID }
        }).then(function (result) {

        });
    }

    $scope.PreviewResponses = function () {
        //Allif
        var linkedID = 0;
        $scope.AllifAssetName = localStorage.getItem('AllifAssetName');
        if ($scope.AllifAssetName.toUpperCase() == $("#allifClass").val().toUpperCase()) {
            $scope.showFields = true;
        } else {
            $scope.showFields = false;
        }

        //if ($scope.LinkedID != '') {
        //    linkedID = $scope.LinkedID;
        //}
        //end
        //, LinkID: linkedID 
        $http.get('/DACWorkFlow/GetPreviewResponses/', { params: { DACFormID: _DACFormID, QSecID: _QSecID, SecPartID: _SecPartID, ProcessGroupID: $scope.ProcessGroupID } })
            //$http({
            //    method: 'GET',
            //    //url: '/DACWorkFlow/GetPreviewResponses/' + _DACFormID + '/' + _QSecID + '/' + _SecPartID + '/' + $scope.ProcessGroupID
            //    url: '/DACWorkFlow/GetPreviewResponses/' + _DACFormID + '/' + _QSecID + '/' + _SecPartID + '/' + $scope.ProcessGroupID + '/' + linkedID
            //}).
            .success(function (result) {
                $scope.QuestionsList = result
            });
    }

    $scope.EditAnswer = function (QID, QSecID, DACFormID) {
        //Allif
        $scope.AllifAssetName = localStorage.getItem('AllifAssetName');
        if ($scope.AllifAssetName.toUpperCase() == $("#allifClass").val().toUpperCase()) {

            $scope.showFields = true;
        } else {
            $scope.showFields = false;
        }
        //end

        $http({
            method: 'GET',
            url: '/DACWorkFlow/GetQuestion/' + QID + '/' + QSecID + '/' + DACFormID
        }).success(function (result) {
            $scope.AnswerDetails = result

            $("#AnswerEdit").modal();
            $("#divLinkQuestionSection").hide();
        });
    }

    var RadioBtnValue = '';
    //$scope.SetValue = function (RadioBtnSelectedValue) {
    //    RadioBtnValue = RadioBtnSelectedValue
    //}

    var AnsComments = '';
    var MetricRadioBtnValue = '';
    var MetricAnsComments = '';
    var LinkRadioBtnValue = '';
    var LinkAnsComments = '';
    var LinkMetricRadioBtnValue = '';
    var LinkMetricAnsComments = '';
    var YesUpdateQid = '';
    var NoUpdateQid = '';
    var YesRadioBtnValue = '';
    var NoRadioBtnValue = '';
    $scope.SaveAnswer = function (AnswerID) {
        try {
            YesUpdateQid = document.getElementById('hdYesLinkQId').value;
            NoUpdateQid = document.getElementById('hdNoLinkQId').value;
            if (document.getElementById('Yes_' + AnswerID).checked) {
                RadioBtnValue = document.getElementById('Yes_' + AnswerID).value;
                //[ITC Infotech]
                NoRadioBtnValue = '';
                YesRadioBtnValue = 'Yes';
            }

            if (document.getElementById('No_' + AnswerID).checked) {
                RadioBtnValue = document.getElementById('No_' + AnswerID).value;
                //[ITC Infotech]
                //Update Yes question value
                NoRadioBtnValue = 'Yes';
                YesRadioBtnValue = '';
            }

            //if (document.getElementById('NA_' + AnswerID).checked) {
            //    RadioBtnValue = document.getElementById('NA_' + AnswerID).value;
            //}

            AnsComments = document.getElementById('Comments_' + AnswerID).value;
            //Allif
            $scope.AllifAssetName = localStorage.getItem('AllifAssetName');
            if ($scope.AllifAssetName.toUpperCase() == $("#allifClass").val().toUpperCase()) {
                if (document.getElementById('hdMetricValue').value != '') {
                    if (document.getElementById('Metric_Yes_' + AnswerID).checked) {
                        MetricRadioBtnValue = document.getElementById('Metric_Yes_' + AnswerID).value;
                    }

                    if (document.getElementById('Metric_No_' + AnswerID).checked) {
                        MetricRadioBtnValue = document.getElementById('Metric_No_' + AnswerID).value;
                    }

                    //if (document.getElementById('Metric_NA_' + AnswerID).checked) {
                    //    MetricRadioBtnValue = document.getElementById('Metric_NA_' + AnswerID).value;
                    //}

                    MetricAnsComments = document.getElementById('Metric_Comments_' + AnswerID).value;
                }

                //both Yes and No questions are same no need update
                if (YesUpdateQid != NoUpdateQid) {
                    try {
                        //Yes Update
                        $http({
                            method: 'POST',
                            url: '/DACWorkFlow/UpdateUnLinkQuestion/',
                            data: { DACFormID: _DACFormID, QSecID: _QSecID, ProcessGroupID: $scope.ProcessGroupID, Qid: YesUpdateQid, RadioBtnValue: YesRadioBtnValue }
                            //Save message handled in main question
                        }).then(function (result) {
                        });
                    } catch (err) {
                        $scope.ErrorMessage = err.message;
                    }

                    //No Update
                    try {
                        $http({
                            method: 'POST',
                            url: '/DACWorkFlow/UpdateUnLinkQuestion/',
                            data: { DACFormID: _DACFormID, QSecID: _QSecID, ProcessGroupID: $scope.ProcessGroupID, Qid: NoUpdateQid, RadioBtnValue: NoRadioBtnValue }
                            //Save message handled in main question
                        }).then(function (result) {
                        });
                    } catch (err) {
                        $scope.ErrorMessage = err.message;
                    }
                }
                //}
                //End               
            }
            //allif end

            //Save other questions
            try {
                if (document.getElementById('Yes_' + AnswerID).checked || document.getElementById('No_' + AnswerID).checked) {
                    $http({
                        method: 'POST',
                        url: '/DACWorkFlow/SaveAnswer/',
                        data: { AnswerID: AnswerID, RadioBtnValue: RadioBtnValue, AnsComments: AnsComments, MetricRadioBtnValue: MetricRadioBtnValue, AnsMetricComments: MetricAnsComments }
                    }).then(function (result) {
                        if (result.data == 'True') {
                            $scope.SuccessMessage = 'Saved Successfully!!.';
                            $("#SaveSuccessMessage").modal();
                        } else {
                            $scope.ErrorMessage = result.data;
                            $scope.isDisabled = false;
                            $("#ErrorMessage").modal();
                        }
                    });
                }
            } catch (err) {
                $scope.ErrorMessage = err.message;
                $("#ErrorMessage").modal();
            }
        } catch (err) {
            $scope.ErrorMessage = err.message;
            $("#ErrorMessage").modal();
        }
    }

    $scope.SubmitFinalAnswers = function () {
        $http({
            method: 'POST',
            url: '/DACWorkFlow/FinalSubmitResponses/',
            data: { DACFormID: _DACFormID, QSecID: _QSecID, SecPartID: _SecPartID, ProcessGroupID: $scope.ProcessGroupID }
        }).then(function (result) {
            if (result.data == 'True') {
                $scope.isSubmitDisabled = true;
                if ($scope.ProcessGroupID == 1) {
                    $scope.SuccessMessage = 'The Deal Acquisition Checklist has been reviewed at Pre-IC stage.';
                } else if ($scope.ProcessGroupID == 2) {
                    $scope.SuccessMessage = 'The Deal Acquisition Checklist has been reviewed at Final-IC stage.';
                }
                $("#SuccessMessage").modal();
            } else {
                $scope.ErrorMessage = result.data;
                $scope.isDisabled = false;
                $("#ErrorMessage").modal();
            }
        });
    }

    $scope.RefreshPage = function () {
        $scope.PreviewResponses();
    }

    $scope.RedirectToStatusPage = function () {
        window.location.pathname = '/DAC/PendingTaskListForQues/';
    }

    $scope.ReStart = function () {
        $http({
            method: 'POST',
            url: '/DACWorkFlow/ResetSectionAnswerValue/',
            data: { DACFormID: _DACFormID, QSecID: _QSecID, SecPartID: _SecPartID, ProcessGroupID: $scope.ProcessGroupID }
        }).then(function (result) {
            if (result.data == 'True') {
                //No Actions required
            } else {
                $scope.ErrorMessage = result.data;
                $("#ErrorMessage").modal();
            }
        });
        window.location.pathname = '/DACWorkFlow/AttemptPreIC/';
    }

    //[ITCInfotech - Start]
    //$scope.TestFunction = function () {
    //    alert('test form' + $scope.QuestionsList);



    //    angular.forEach($scope.QuestionsList, function (value, index) {

    //        alert(value.RadioBtnValue + ' o--');

    //        if (value.RadioBtnValue != '' && value.RadioBtnValue.ToUpper() == 'YES') {
    //            $("#yesFollowUp_" + value.QID).show();
    //        }
    //        //if (document.getElementById('Yes_' + value.QID).checked) {
    //        //    $("#yesFollowUp_" + value.QID).show();
    //        //}
    //        //if (document.getElementById('No_' + value.QID).checked) {
    //        //    $("#noFollowUp_" + value.QID).show();
    //        //}
    //        //end
    //    })
    //}

    $scope.GetFollowupTextForQuestionId = function (QuestionId, LinkQuestionId, responseType) {
        console.log('QID ' + QuestionId + ' Link QID ' + LinkQuestionId + ' Resp Type ' + responseType)
        $scope.AllifAssetName = localStorage.getItem('AllifAssetName');
        if ($scope.AllifAssetName.toUpperCase() == $("#allifClass").val().toUpperCase()) {
            if (responseType.toUpperCase() == 'YES') {
                $("#yesFollowUp_" + QuestionId).show();
                $("#noFollowUp_" + QuestionId).hide();
            }
            else if (responseType.toUpperCase() == 'NO') {
                $("#yesFollowUp_" + QuestionId).hide();
                $("#noFollowUp_" + QuestionId).show();
            }
            else {
                //TODO: N/A
            }
            var ItemExists = false;
            $scope.NextIsDisabled = true;
            if (LinkQuestionId != null && LinkQuestionId != '' && LinkQuestionId != 0 &&
                ($("#yesFollowUp_" + QuestionId).prop('checked', true) || $("#noFollowUp_" + QuestionId).prop('checked', true))) {
                //enable next button if link qustion id is exists
                $scope.NextIsDisabled = false;

                console.log($scope.isPageIncremented + ' ' + LinkQuestionId)
                if ($scope.isPageIncremented == false) {
                    $scope.TotalQuestions = $scope.TotalQuestions + 1;
                    console.log('followup Question - after - Total Questions ' + $scope.TotalQuestions + ' Current Questions ' + $scope.CurrentQuestion)
                    ApplyProgress($scope.TotalQuestions, $scope.CurrentQuestion);
                    $scope.isPageIncremented = true;
                }
            }
        }
    }

    //$scope.finRepeat=function () {
    //    return function (scope, element, attrs) {
    //        if (scope.$last) {
    //            // Here is where already executes the jquery
    //            $(document).ready(function () {
    //                console.log("ngRepeatFinished..wwwww.");
    //                var list = localStorage.getItem('QuestionList');
    //                console.log(JSON.parse(list));
    //                var QuestionList = JSON.parse(list);
    //            });
    //        }
    //    }
    //}

    //$scope.ngRepeatFinished = function () {

    //    console.log("ngRepeatFinished...");
    //    var list = localStorage.getItem('QuestionList');
    //    console.log(JSON.parse(list));
    //    var QuestionList = JSON.parse(list);

    //    $("#test").hide();
    //    $("#yesFollowUp_").hide();
    //    $("#yesFollowUp1_").hide();
    //    $("#yesFollowUp1a_").hide();

    //    $.each(QuestionList, function (index, value) {
    //        var QuestionId = QuestionList[index].QID;
    //        console.log("#yesFollowUp_" + QuestionId);

    //        if (QuestionList[index].RadioBtnValue != '' && QuestionList[index].RadioBtnValue.toUpperCase() == 'NO') {
    //            //$("#yesFollowUp_" + QuestionId).hide();
    //            //$("#noFollowUp_" + QuestionId).show();
    //            //$("#noFollowUp_" + QuestionId).css('background-color', 'red');
    //            angular.element('.row').scope().GetFollowupTextForQuestionId(QuestionId, QuestionList[index].NoLinkQuestionId, 'No');
    //        }
    //        else {
    //            angular.element('.row').scope().GetFollowupTextForQuestionId(QuestionId, ItQuestionList[index].YesLinkQuestionId, 'Yes');
    //        }
    //    });
    //}

    //$(document).ready(function () {
    //    setTimeout(5000,)
    //});
    //jQuery
    //$(document).ready(function () {
    //    console.log("document is ready...");
    //    var list = localStorage.getItem('QuestionList'); 
    //    console.log(JSON.parse( list));
    //    var QuestionList = JSON.parse(list);

    //    $("#test").css('display', 'none');
    //    $("#yesFollowUp").css('display', 'none');
    //    $("#yesFollowUp1_").css('display', 'none');
    //    $("#yesFollowUp1a_").css('display', 'none');


    //    //angular.element('#AttemptPreIC').scope().apply() 
    //    $.each(QuestionList, function (index, value) {
    //        var QuestionId = QuestionList[index].QID;
    //        console.log("#yesFollowUp_" + QuestionId);
    //        $("#yesFollowUp_" + QuestionId).css('display', 'none');
    //        $("#noFollowUp_" + QuestionId).css('display', 'none');
    //        if (QuestionList[index].RadioBtnValue != '' && QuestionList[index].RadioBtnValue.toUpperCase() == 'NO') {
    //            //$("#yesFollowUp_" + QuestionId).hide();
    //            //$("#noFollowUp_" + QuestionId).show();
    //            //$("#noFollowUp_" + QuestionId).css('background-color', 'red');
    //            angular.element('.row').scope().GetFollowupTextForQuestionId(QuestionId, QuestionList[index].NoLinkQuestionId, 'No');
    //        }
    //        else {
    //            angular.element('.row').scope().GetFollowupTextForQuestionId(QuestionId, ItQuestionList[index].YesLinkQuestionId, 'Yes');
    //        }
    //    });
    //});
    //[ITCInfotech - End]
});
