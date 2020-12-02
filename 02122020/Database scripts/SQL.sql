USE [ActisFundChecklist]
GO
/****** Object:  StoredProcedure [dbo].[M_G_UserByGroupAsset]    Script Date: 12/1/2020 4:18:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[M_G_UserByGroupAsset] 
@AssetID INT,
@GROUP_ID INT,
@ProjectID INT
AS
BEGIN
	SET NOCOUNT ON;
		BEGIN
			SELECT DISTINCT --01-DEC-20: ADDED DISTINCT TO REMOVE DUPLICATES
				A.USER_ID AS drpUSER_ID, C.USER_NAME AS drpUSER_NAME, D.ProjectID, E.ProjectName, A.GROUP_ID, D.GROUP_NAME, B.AssetID, F.AssetName
			FROM 
				[dbo].[UserGroupMapper] A
			INNER JOIN [dbo].[AssetUserMapper] B ON B.USER_ID = A.USER_ID
			INNER JOIN [dbo].[AssetClass] F ON F.AssetID = B.AssetID
			INNER JOIN [dbo].[TBL_USER_MASTER] C ON C.USER_ID = A.USER_ID AND C.IS_ACTIVE=1
			INNER JOIN [dbo].[TBL_USER_GROUP] D ON D.GROUP_ID = A.GROUP_ID
			INNER JOIN [dbo].[ProjectSettings] E ON E.ProjectID = D.ProjectID
			WHERE 
				D.ProjectID=@ProjectID AND A.GROUP_ID=@GROUP_ID AND B.AssetID=@AssetID
			ORDER BY 
				C.USER_NAME, A.GROUP_ID, B.AssetID
		END
END

GO
-------------------------------------------------------------------------

/****** Object:  StoredProcedure [dbo].[CreateNewDAC]    Script Date: 12/1/2020 4:23:56 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[CreateNewDAC]
    (                         
     @DACFormNumber			VARCHAR(50) = '',  
     @AssetID				INT,
	 @DealUserID			INT,
	 @DealID				INT,
	 @NewInvestOrFollowUp	VARCHAR(100),
	 @DealSize				MONEY,
	 @CurrentInvestment		MONEY,
	 @AmountAlreadyFunded	MONEY,
	 @FundName				VARCHAR(MAX),
	 @CreatedBy				INT,
	 @Remarks				TEXT,
	 @ChecklistFor			VARCHAR(MAX),
	 @TotalCommitments		MONEY
	)                                                          
AS   
                                                            
BEGIN   
	DECLARE @DACFormID INT
	DECLARE @QSecID INT
	DECLARE @SecPartID INT
	DECLARE @GROUP_ID INT
	DECLARE @StatusID INT
	DECLARE @ProcessStatus INT = 1  -- DAC Form Created by TS
	DECLARE @ProcessGroupID INT = 1 -- PRE-IC

	DECLARE @DealName		VARCHAR(200)
	DECLARE @FromName		VARCHAR(100)
	DECLARE @FromEmailID	VARCHAR(100)
	DECLARE @SectionName	VARCHAR(100)
	DECLARE @SectionHeading	VARCHAR(200)
	DECLARE @SignedFormNoWithURL	VARCHAR(MAX)

	DECLARE @ToEmailID		VARCHAR(100)
	DECLARE @ToName			VARCHAR(100)
	DECLARE @EmailSubject	NVARCHAR(MAX)
	DECLARE @EmailBody		NVARCHAR(MAX)
	DECLARE @GroupUser		INT

	-- RESET QuestionGroupID to NULL for all Linked Questions: Starts
	UPDATE DACQuestionBank SET QuestionGroupID = NULL 
		WHERE QID IN (SELECT LinkedQID FROM DACFollowupQuestion WHERE LinkedQID IS NOT NULL) 
		AND (QuestionGroupID IS NOT NULL) 
		AND AssetID = @AssetID
	-- RESET QuestionGroupID to NULL for all Linked Questions: Ends

	IF NOT EXISTS (SELECT 1 FROM [dbo].[DACFormMaster] WHERE DACFormNumber = @DACFormNumber)
	BEGIN
		-- INSERT FORM DETAILS IF DAC FORM NUMBER NOT PRESENT
		INSERT INTO [dbo].[DACFormMaster] ([DACFormNumber],[AssetID],[DealID],[NewInvestOrFollowUp],[DealSize],[CurrentInvestment],[AmountAlreadyFunded],[FundName],[CreatedBy],[StatusID],[Remarks],[ChecklistFor],[TotalCommitmentsBeforeClosing])
		VALUES (@DACFormNumber,@AssetID,@DealID,@NewInvestOrFollowUp,@DealSize,@CurrentInvestment,@AmountAlreadyFunded,@FundName,@CreatedBy,2,@Remarks, @ChecklistFor, @TotalCommitments) 			

		SELECT @DACFormID = SCOPE_IDENTITY();			
			DECLARE QSecIDs CURSOR FOR SELECT QSecID FROM [dbo].[DACQuestionSections] WHERE ProcessGroupID = 1 AND AssetID=@AssetID AND IsActive=1
			OPEN QSecIDs
			FETCH NEXT FROM QSecIDs INTO @QSecID
			WHILE @@FETCH_STATUS=0
			BEGIN
				-- ANOTHER LOOP START
				DECLARE GROUP_IDs CURSOR FOR SELECT GROUP_ID FROM [dbo].[DACGroupSecMapper] WHERE QSecID=@QSecID AND IsForPreIC=1
				OPEN GROUP_IDs
				FETCH NEXT FROM GROUP_IDs INTO @GROUP_ID
				WHILE @@FETCH_STATUS=0
				BEGIN					
					SELECT @StatusID = StatusID FROM [dbo].[DACSectionAttemptStatus] WHERE QSecID = @QSecID AND StatusBit = 0
					
					IF(@GROUP_ID = 21) --IF DETAL TEAM
					BEGIN
						INSERT INTO [dbo].[DACSectionAttemptHistory] (DACFormID,ProcessGroupID,StatusID,CreatedBy,PendingWithGroup,PendingWithUserID,QSecID) VALUES(@DACFormID,@ProcessGroupID,@StatusID,@CreatedBy,@GROUP_ID,@DealUserID,@QSecID);
						
						--SENDING EMAIL
						BEGIN
							SELECT @DACFormNumber = DACFormNumber, @DealID = DealID FROM [dbo].[DACFormMaster] WHERE DACFormID=@DACFormID	
							SELECT @DealName = DealName FROM [dbo].[DealName] WHERE DealID = @DealID
							SELECT @FromName = USER_NAME, @FromEmailID = SYS_EMAIL_ID FROM [dbo].[TBL_USER_MASTER] WHERE USER_ID = @CreatedBy
							SELECT @SectionName = SectionName, @SectionHeading = SectionHeading FROM [dbo].[DACQuestionSections] WHERE QSecID = @QSecID
							SELECT @SignedFormNoWithURL = '<a href=' + '"' + 'https://' + 'fundchecklist.act.is/DAC/PendingTaskListForQues/' + CONVERT(VARCHAR(10), @DACFormID) + '"' + '>' + @DACFormNumber + '</a>'
							
							BEGIN
								SELECT @ToName = USER_NAME, @ToEmailID = SYS_EMAIL_ID FROM [dbo].[TBL_USER_MASTER] WHERE USER_ID = @DealUserID			
								SELECT @EmailSubject = SubjectText, @EmailBody = BodyText FROM [dbo].[DACEmailCategory] WHERE EmailCatID=1 AND IsActive=1
				
								SELECT @EmailSubject = REPLACE(@EmailSubject, '[DAC_FORM_NUMBER]', @DACFormNumber)
								SELECT @EmailSubject = REPLACE(@EmailSubject, '[SECTION_NAME]', @SectionName)
								SELECT @EmailSubject = REPLACE(@EmailSubject, '[SECTION_HEADING]', @SectionHeading)
								SELECT @EmailSubject = REPLACE(@EmailSubject, '[DEAL_NAME]', @DealName)

								SELECT @EmailBody = REPLACE(@EmailBody, '[USER_NAME]', @ToName)
								SELECT @EmailBody = REPLACE(@EmailBody, '[DAC_FORM_NUMBER]', @SignedFormNoWithURL)		
								SELECT @EmailBody = REPLACE(@EmailBody, '[SECTION_NAME]', @SectionName)
								SELECT @EmailSubject = REPLACE(@EmailSubject, '[SECTION_HEADING]', @SectionHeading)

								INSERT INTO [dbo].[TBL_SYSTEM_EMAILS] (FROM_NAME,FROM_EMAIL,TO_NAME,TO_EMAIL,EMAIL_SUBJECT,EMAIL_BODY) VALUES(@FromName,@FromEmailID,@ToName,@ToEmailID,@EmailSubject,@EmailBody)
								--INSERT INTO [london-sql3].[Intranet2005_Live].[dbo].[email] (subject,body,fromname,fromaddress,toname,toaddress,addeddate,ishtml) values(@EmailSubject,@EmailBody,@FromName,@FromEmailID,@ToName,@ToEmailID,getdate(),1)
							END
						END
						--END
					END
					ELSE
					BEGIN
						INSERT INTO [dbo].[DACSectionAttemptHistory] (DACFormID,ProcessGroupID,StatusID,CreatedBy,PendingWithGroup,QSecID) VALUES(@DACFormID,@ProcessGroupID,@StatusID,@CreatedBy,@GROUP_ID,@QSecID);					
						
						--SENDING EMAIL
						BEGIN							
							--LOOP START
							DECLARE GroupUsrs CURSOR FOR SELECT USER_ID FROM [dbo].[UserGroupMapper] WHERE GROUP_ID=@GROUP_ID
							OPEN GroupUsrs
							FETCH NEXT FROM GroupUsrs INTO @GroupUser
							WHILE @@FETCH_STATUS=0

							BEGIN
								SELECT @DACFormNumber = DACFormNumber, @DealID = DealID FROM [dbo].[DACFormMaster] WHERE DACFormID=@DACFormID	
								SELECT @DealName = DealName FROM [dbo].[DealName] WHERE DealID = @DealID
								SELECT @FromName = USER_NAME, @FromEmailID = SYS_EMAIL_ID FROM [dbo].[TBL_USER_MASTER] WHERE USER_ID = @CreatedBy
								SELECT @SectionName = SectionName, @SectionHeading = SectionHeading FROM [dbo].[DACQuestionSections] WHERE QSecID = @QSecID
								SELECT @SignedFormNoWithURL = '<a href=' + '"' + 'https://' + 'fundchecklist.act.is/DAC/PendingTaskListForQues/' + CONVERT(VARCHAR(10), @DACFormID) + '"' + '>' + @DACFormNumber + '</a>'
							--SELECT SubjectText, BodyText FROM [dbo].[DACEmailCategory] WHERE EmailCatID=1
									BEGIN
										SELECT @ToName = USER_NAME, @ToEmailID = SYS_EMAIL_ID FROM [dbo].[TBL_USER_MASTER] WHERE USER_ID = @GroupUser			
										SELECT @EmailSubject = SubjectText, @EmailBody = BodyText FROM [dbo].[DACEmailCategory] WHERE EmailCatID=1 AND IsActive=1
				
										SELECT @EmailSubject = REPLACE(@EmailSubject, '[DAC_FORM_NUMBER]', @DACFormNumber)
										SELECT @EmailSubject = REPLACE(@EmailSubject, '[SECTION_NAME]', @SectionName)
										SELECT @EmailSubject = REPLACE(@EmailSubject, '[SECTION_HEADING]', @SectionHeading)
										SELECT @EmailSubject = REPLACE(@EmailSubject, '[DEAL_NAME]', @DealName)

										SELECT @EmailBody = REPLACE(@EmailBody, '[USER_NAME]', @ToName)
										SELECT @EmailBody = REPLACE(@EmailBody, '[DAC_FORM_NUMBER]', @SignedFormNoWithURL)		
										SELECT @EmailBody = REPLACE(@EmailBody, '[SECTION_NAME]', @SectionName)
										SELECT @EmailSubject = REPLACE(@EmailSubject, '[SECTION_HEADING]', @SectionHeading)

										INSERT INTO [dbo].[TBL_SYSTEM_EMAILS] (FROM_NAME,FROM_EMAIL,TO_NAME,TO_EMAIL,EMAIL_SUBJECT,EMAIL_BODY) VALUES(@FromName,@FromEmailID,@ToName,@ToEmailID,@EmailSubject,@EmailBody)
										--INSERT INTO [london-sql3].[Intranet2005_Live].[dbo].[email] (subject,body,fromname,fromaddress,toname,toaddress,addeddate,ishtml) values(@EmailSubject,@EmailBody,@FromName,@FromEmailID,@ToName,@ToEmailID,getdate(),1)
									END	
									FETCH NEXT FROM GroupUsrs INTO @GroupUser
							END

							CLOSE GroupUsrs
							DEALLOCATE GroupUsrs
							--LOOP END
						END
						--END
					END
					FETCH NEXT FROM GROUP_IDs INTO @GROUP_ID					
				END
				CLOSE GROUP_IDs
				DEALLOCATE GROUP_IDs
				-- ANOTHER LOOP END
								
				FETCH NEXT FROM QSecIDs INTO @QSecID
			END
			CLOSE QSecIDs
			DEALLOCATE QSecIDs	
		INSERT INTO [dbo].[DACProcessHistory] (DACFormID,StatusID,CreatedBy,ProcessGroupID) VALUES(@DACFormID,@ProcessStatus,@CreatedBy,@ProcessGroupID);
		EXEC [dbo].[AddQuestionsForUsers] @ProcessGroupID, @AssetID, @DACFormID, @CreatedBy, @DealUserID  
	END
	ELSE
	BEGIN				
		DECLARE @Year CHAR(2)
		DECLARE @GeneratedFNumber VARCHAR(50)				
				
		SET @Year = (SELECT Right(Year(getDate()),2))
		SET @GeneratedFNumber = (SELECT ISNULL(MAX([FormNumber]), '0001') FROM [AFIPFormMaster]) 	
		IF (@GeneratedFNumber = '0001')
		BEGIN
			SELECT @GeneratedFNumber = 'FND-' + @GeneratedFNumber + '-' + @Year			
		END
		ELSE
		BEGIN
			DECLARE @NEXT_SEQ VARCHAR(100) = ''
			DECLARE @I INT = 0		

			SELECT @NEXT_SEQ = ((LEFT(RIGHT(CAST(MAX(DACFormNumber) AS VARCHAR(12)),7), LEN(RIGHT(CAST(MAX(DACFormNumber) AS VARCHAR(12)),7))-3))+1) FROM DACFormMaster
						
			SET @I = CAST(right(@NEXT_SEQ,4) AS INT)
			SELECT @GeneratedFNumber = 'FND-' + right('000' + convert(varchar(10),@I),4) + '-' + @Year
			
			-- INSERT FORM DETAILS IF DAC FORM NUMBER IS PRESENT
			INSERT INTO [dbo].[DACFormMaster] ([DACFormNumber],[AssetID],[DealID],[NewInvestOrFollowUp],[DealSize],[CurrentInvestment],[AmountAlreadyFunded],[FundName],[CreatedBy],[StatusID],[Remarks],[ChecklistFor],[TotalCommitmentsBeforeClosing])  
			VALUES (@GeneratedFNumber,@AssetID,@DealID,@NewInvestOrFollowUp,@DealSize,@CurrentInvestment,@AmountAlreadyFunded,@FundName,@CreatedBy,2,@Remarks,@ChecklistFor,@TotalCommitments) 			
			SELECT @DACFormID = SCOPE_IDENTITY();

				DECLARE QSecIDs CURSOR FOR SELECT QSecID FROM [dbo].[DACQuestionSections] WHERE ProcessGroupID = 1 AND AssetID=@AssetID AND IsActive=1
				OPEN QSecIDs
				FETCH NEXT FROM QSecIDs INTO @QSecID
				WHILE @@FETCH_STATUS=0
				BEGIN
					-- ANOTHER LOOP START
					DECLARE GROUP_IDs CURSOR FOR SELECT GROUP_ID FROM [dbo].[DACGroupSecMapper] WHERE QSecID=@QSecID AND IsForPreIC=1
					OPEN GROUP_IDs
					FETCH NEXT FROM GROUP_IDs INTO @GROUP_ID
					WHILE @@FETCH_STATUS=0
					BEGIN						
						SELECT @StatusID = StatusID FROM [dbo].[DACSectionAttemptStatus] WHERE QSecID = @QSecID AND StatusBit = 0
						
						IF(@GROUP_ID = 21)
						BEGIN

							INSERT INTO [dbo].[DACSectionAttemptHistory] (DACFormID,ProcessGroupID,StatusID,CreatedBy,PendingWithGroup,PendingWithUserID,QSecID) VALUES(@DACFormID,@ProcessGroupID,@StatusID,@CreatedBy,@GROUP_ID,@DealUserID,@QSecID);

							--SENDING EMAIL FOR DEAL TEAM MEMBER
							BEGIN
								SELECT @DACFormNumber = DACFormNumber, @DealID = DealID FROM [dbo].[DACFormMaster] WHERE DACFormID=@DACFormID	
								SELECT @DealName = DealName FROM [dbo].[DealName] WHERE DealID = @DealID
								SELECT @FromName = USER_NAME, @FromEmailID = SYS_EMAIL_ID FROM [dbo].[TBL_USER_MASTER] WHERE USER_ID = @CreatedBy
								SELECT @SectionName = SectionName, @SectionHeading = SectionHeading FROM [dbo].[DACQuestionSections] WHERE QSecID = @QSecID
								SELECT @SignedFormNoWithURL = '<a href=' + '"' + 'https://' + 'fundchecklist.act.is/DAC/PendingTaskListForQues/' + CONVERT(VARCHAR(10), @DACFormID) + '"' + '>' + @DACFormNumber + '</a>'
							
								BEGIN
									SELECT @ToName = USER_NAME, @ToEmailID = SYS_EMAIL_ID FROM [dbo].[TBL_USER_MASTER] WHERE USER_ID = @DealUserID			
									SELECT @EmailSubject = SubjectText, @EmailBody = BodyText FROM [dbo].[DACEmailCategory] WHERE EmailCatID=1 AND IsActive=1
				
									SELECT @EmailSubject = REPLACE(@EmailSubject, '[DAC_FORM_NUMBER]', @DACFormNumber)
									SELECT @EmailSubject = REPLACE(@EmailSubject, '[SECTION_NAME]', @SectionName)
									SELECT @EmailSubject = REPLACE(@EmailSubject, '[SECTION_HEADING]', @SectionHeading)
									SELECT @EmailSubject = REPLACE(@EmailSubject, '[DEAL_NAME]', @DealName)

									SELECT @EmailBody = REPLACE(@EmailBody, '[USER_NAME]', @ToName)
									SELECT @EmailBody = REPLACE(@EmailBody, '[DAC_FORM_NUMBER]', @SignedFormNoWithURL)		
									SELECT @EmailBody = REPLACE(@EmailBody, '[SECTION_NAME]', @SectionName)
									SELECT @EmailSubject = REPLACE(@EmailSubject, '[SECTION_HEADING]', @SectionHeading)

									INSERT INTO [dbo].[TBL_SYSTEM_EMAILS] (FROM_NAME,FROM_EMAIL,TO_NAME,TO_EMAIL,EMAIL_SUBJECT,EMAIL_BODY) VALUES(@FromName,@FromEmailID,@ToName,@ToEmailID,@EmailSubject,@EmailBody)
									--INSERT INTO [london-sql3].[Intranet2005_Live].[dbo].[email] (subject,body,fromname,fromaddress,toname,toaddress,addeddate,ishtml) values(@EmailSubject,@EmailBody,@FromName,@FromEmailID,@ToName,@ToEmailID,getdate(),1)
								END
							END
							--END
						END
						ELSE
						BEGIN
							--SENDING EMAIL FOR OTHER USERS EXCEPT DEAL TEAM MEMBER
							BEGIN							
								--LOOP START
								DECLARE GroupUsrs CURSOR FOR SELECT USER_ID FROM [dbo].[UserGroupMapper] WHERE GROUP_ID=@GROUP_ID
								OPEN GroupUsrs
								FETCH NEXT FROM GroupUsrs INTO @GroupUser
								WHILE @@FETCH_STATUS=0

								BEGIN
									SELECT @DACFormNumber = DACFormNumber, @DealID = DealID FROM [dbo].[DACFormMaster] WHERE DACFormID=@DACFormID	
									SELECT @DealName = DealName FROM [dbo].[DealName] WHERE DealID = @DealID
									SELECT @FromName = USER_NAME, @FromEmailID = SYS_EMAIL_ID FROM [dbo].[TBL_USER_MASTER] WHERE USER_ID = @CreatedBy
									SELECT @SectionName = SectionName, @SectionHeading = SectionHeading FROM [dbo].[DACQuestionSections] WHERE QSecID = @QSecID
									SELECT @SignedFormNoWithURL = '<a href=' + '"' + 'https://' + 'fundchecklist.act.is/DAC/PendingTaskListForQues/' + CONVERT(VARCHAR(10), @DACFormID) + '"' + '>' + @DACFormNumber + '</a>'
							
										BEGIN
											SELECT @ToName = USER_NAME, @ToEmailID = SYS_EMAIL_ID FROM [dbo].[TBL_USER_MASTER] WHERE USER_ID = @GroupUser			
											SELECT @EmailSubject = SubjectText, @EmailBody = BodyText FROM [dbo].[DACEmailCategory] WHERE EmailCatID=1 AND IsActive=1
				
											SELECT @EmailSubject = REPLACE(@EmailSubject, '[DAC_FORM_NUMBER]', @DACFormNumber)
											SELECT @EmailSubject = REPLACE(@EmailSubject, '[SECTION_NAME]', @SectionName)
											SELECT @EmailSubject = REPLACE(@EmailSubject, '[SECTION_HEADING]', @SectionHeading)
											SELECT @EmailSubject = REPLACE(@EmailSubject, '[DEAL_NAME]', @DealName)

											SELECT @EmailBody = REPLACE(@EmailBody, '[USER_NAME]', @ToName)
											SELECT @EmailBody = REPLACE(@EmailBody, '[DAC_FORM_NUMBER]', @SignedFormNoWithURL)		
											SELECT @EmailBody = REPLACE(@EmailBody, '[SECTION_NAME]', @SectionName)
											SELECT @EmailSubject = REPLACE(@EmailSubject, '[SECTION_HEADING]', @SectionHeading)

											INSERT INTO [dbo].[TBL_SYSTEM_EMAILS] (FROM_NAME,FROM_EMAIL,TO_NAME,TO_EMAIL,EMAIL_SUBJECT,EMAIL_BODY) VALUES(@FromName,@FromEmailID,@ToName,@ToEmailID,@EmailSubject,@EmailBody)
											--INSERT INTO [london-sql3].[Intranet2005_Live].[dbo].[email] (subject,body,fromname,fromaddress,toname,toaddress,addeddate,ishtml) values(@EmailSubject,@EmailBody,@FromName,@FromEmailID,@ToName,@ToEmailID,getdate(),1)
										END	
										FETCH NEXT FROM GroupUsrs INTO @GroupUser
								END

								CLOSE GroupUsrs
								DEALLOCATE GroupUsrs
								--LOOP END
							END
							--END

							INSERT INTO [dbo].[DACSectionAttemptHistory] (DACFormID,ProcessGroupID,StatusID,CreatedBy,PendingWithGroup,QSecID) VALUES(@DACFormID,@ProcessGroupID,@StatusID,@CreatedBy,@GROUP_ID,@QSecID);					
							
						END

						FETCH NEXT FROM GROUP_IDs INTO @GROUP_ID
					END
					CLOSE GROUP_IDs
					DEALLOCATE GROUP_IDs
					-- ANOTHER LOOP END
								
					FETCH NEXT FROM QSecIDs INTO @QSecID
				END
				CLOSE QSecIDs
				DEALLOCATE QSecIDs	

				--SINGLE ENTRY IN [DACProcessHistory] TABLE
				INSERT INTO [dbo].[DACProcessHistory] (DACFormID,StatusID,CreatedBy,ProcessGroupID) VALUES(@DACFormID,@ProcessStatus,@CreatedBy,@ProcessGroupID);

			--ADD QUESTIONS FOR EACH USER
			EXEC [dbo].[AddQuestionsForUsers] @ProcessGroupID, @AssetID, @DACFormID, @CreatedBy, @DealUserID  
			
		END
	END
		
	SELECT 'True' AS results
END

GO

----------------------------------------------------------------------

USE [ActisFundChecklist]
GO
/****** Object:  StoredProcedure [dbo].[DACAddQuestionDetails]    Script Date: 12/1/2020 5:39:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

--Add Question details
ALTER PROCEDURE [dbo].[DACAddQuestionDetails]
    (                         
     @AssetId	INT,  
     @SectionId	  INT,
	 @SubSectionId INT,
	 @Staus		BIT,
	 @Mandatory BIT,
	 @QuestionGroupId INT,
	 @QuestionText			VARCHAR(MAX),
	 @YesFollowupText			VARCHAR(MAX),
	 @NoFollowupText			VARCHAR(MAX),
	 @NoteRefText			VARCHAR(MAX),
	 @IsLPSpecific TINYINT,
	 @LP TINYINT,
	 @Metric VARCHAR(MAX),
	 @ClauseRef VARCHAR(MAX),
	 @QuestionNo VARCHAR(10),
	 @ProcessGroupID INT
    )                                                          
AS   
                                                            
BEGIN   
	DECLARE @QuestionMaxId BIGINT
	DECLARE @Questionid BIGINT
	DECLARE @TotalActiveQuestions INT

	INSERT INTO [dbo].[DACQuestionBank] 
	(
			[QusetionNo]  --e.g.FUN-XX31-01
           ,[QuestionText]
           ,[DisplayOrder]
           ,[IsQuestionHeading]
           ,[IsActive]
           ,[IsCompulsory]
           ,[IsSubQuestion]
           --,[ParentQID]
           ,[AssetID]
           ,[QSecID]
           ,[SecPartID]
           ,[QuestionGroupID]  
           --,[PreIC_QID]
           ,[IsLpSpecific]
           ,[LP]
           ,[Metric]
           ,[ClauseReference]
		   ,ProcessGroupId 
	)
	VALUES(
	@QuestionNo
	,@QuestionText
	,1
	,0
	,@Staus
	,@Mandatory
	,0
	, @AssetId
	,@SectionId,
	@SubSectionId
	,@QuestionGroupId
	,@IsLPSpecific
	,@LP
	,@Metric
	,@ClauseRef
	,@ProcessGroupID
	)

	SET @Questionid = @@IDENTITY
	--Insert into Followup Text pass follow text
	INSERT [Dbo].[DACFollowupQuestion]
	(
	QID
	,ResponseType
	,FollowupText
	)
	VALUES
	(
	@Questionid
	,1
	,@YesFollowupText
	)
	--No Followup
	INSERT [Dbo].[DACFollowupQuestion]
	(
	QID
	,ResponseType
	,FollowupText
	)
	VALUES
	(
	@Questionid
	,0
	,@NoFollowupText
	)
	--Note/Reference 

	INSERT [dbo].[DACQuestionRefNote]
	(
	QID
	,QSecID
	,SecPartID
	,QuestionGroupID
	,ReferenceNote
	)
	VALUES
	(
	@Questionid
	,@SectionId
	,@SubSectionId
	,@QuestionGroupId
	,@NoteRefText
	)

	--UPDATE DACQuestionSubSection WITH TOTAL ACTIVE QUESTIONS: Starts
	IF (@AssetId = 4)
	BEGIN	
		SELECT @TotalActiveQuestions = COUNT(*)-1 FROM DACQuestionBank 
			WHERE IsActive = 1 AND QSecID = @SectionId AND SecPartID = @SubSectionId AND AssetID = @AssetId

		UPDATE DACQuestionSubSection SET TotalQuestions = @TotalActiveQuestions 
			WHERE QSecID = @SectionId AND SecPartID = @SubSectionId
	END

	ELSE
	BEGIN
		SELECT @TotalActiveQuestions = COUNT(DISTINCT QuestionGroupID) FROM DACQuestionBank 
			WHERE IsActive = 1 AND QSecID = @SectionId AND SecPartID = @SubSectionId AND AssetID = @AssetId

		UPDATE DACQuestionSubSection SET TotalQuestions = @TotalActiveQuestions 
			WHERE QSecID = @SectionId AND SecPartID = @SubSectionId
	END
	--UPDATE DACQuestionSubSection WITH TOTAL ACTIVE QUESTIONS: Ends

END

GO
-------------------------------------------------------------------------------------------------------

USE [ActisFundChecklist]
GO
/****** Object:  StoredProcedure [dbo].[DACUpdateQuestionDetails]    Script Date: 12/1/2020 5:56:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[DACUpdateQuestionDetails]
    (                         
     @AssetId	INT,  
     @SectionId	  INT,
	 @SubSectionId INT,
	 @Staus		BIT,
	 @Mandatory BIT,
	 @QuestionGroupId INT,
	 @QuestionText			VARCHAR(MAX),
	 @YesFollowupText			VARCHAR(MAX),
	 @NoFollowupText			VARCHAR(MAX),
	 @NoteRefText			VARCHAR(MAX),
	 @IsLPSpecific TINYINT,
	 @LP TINYINT,
	 @Metric VARCHAR(MAX),
	 @ClauseRef VARCHAR(MAX),
	 @QID BIGINT,
	 @YesLinkQID BIGINT,
	 @NoLinkQID BIGINT,
	 @QuestionNo VARCHAR(10)
    )                                                          
AS                                                            
BEGIN   
	DECLARE @TotalActiveQuestions INT

	UPDATE [dbo].[DACQuestionBank] SET
		[QuestionText] = @QuestionText
		,[QuestionGroupID] = @QuestionGroupId
		,[IsLpSpecific] = @IsLPSpecific
		,[LP]=@LP
		,[Metric] = @Metric
		--,[ParentQID] = @LinkQID
		,[QusetionNo] = @QuestionNo
		,[ClauseReference] = @ClauseRef
		,[IsActive]= @Staus
		,[IsCompulsory] = @Mandatory
		,IsSubQuestion =  CASE WHEN (@YesLinkQID != NULL OR @YesLinkQID !=0) OR (@NoLinkQID != NULL OR @NoLinkQID !=0) THEN  1 ELSE 0 END
	WHERE QID = @QID

	--Insert into Followup Text pass follow text
		UPDATE [dbo].[DACFollowupQuestion]
			 SET
				[FollowupText] = @YesFollowupText
				,[LinkedQID] = @YesLinkQID
			WHERE QID = @QID AND ResponseType =1

		UPDATE [dbo].[DACFollowupQuestion]
			SET
			[FollowupText] = @NoFollowupText
			,[LinkedQID] = @NoLinkQID
		WHERE QID = @QID AND ResponseType =0

		UPDATE [dbo].[DACQuestionRefNote]
			 SET
				[ReferenceNote] = @NoteRefText
			WHERE QID = @QID AND QSecID = @SectionId AND SecPartID = @SubSectionId

		--UPDATE DACQuestionSubSection WITH TOTAL ACTIVE QUESTIONS: Starts
		IF (@AssetId = 4)
		BEGIN	
			SELECT @TotalActiveQuestions = COUNT(*)-1 FROM DACQuestionBank 
				WHERE IsActive = 1 AND QSecID = @SectionId AND SecPartID = @SubSectionId AND AssetID = @AssetId

			UPDATE DACQuestionSubSection SET TotalQuestions = @TotalActiveQuestions 
				WHERE QSecID = @SectionId AND SecPartID = @SubSectionId
		END

		ELSE
		BEGIN
			SELECT @TotalActiveQuestions = COUNT(DISTINCT QuestionGroupID) FROM DACQuestionBank 
				WHERE IsActive = 1 AND QSecID = @SectionId AND SecPartID = @SubSectionId AND AssetID = @AssetId

			UPDATE DACQuestionSubSection SET TotalQuestions = @TotalActiveQuestions 
				WHERE QSecID = @SectionId AND SecPartID = @SubSectionId
		END
		--UPDATE DACQuestionSubSection WITH TOTAL ACTIVE QUESTIONS: Ends
END

GO
--------------------------------------------------------------------------------------

