import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, FlatList, Dimensions, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import YouTubeIframe from 'react-native-youtube-iframe';
import styles from '../styles/DetailLessonStyles';
import BASE_URL from '../component/apiConfig';

// Lấy kích thước màn hình để tính chiều cao video
const { width } = Dimensions.get('window');
const videoHeight = (width * 9) / 16;

const DetailLesson = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { _id, userID } = route.params;
  const [videoData, setVideoData] = useState([]);
  const [testData, setTestData] = useState([]);
  const [videoLink, setVideoLink] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  // const [watchedVideoIds, setWatchedVideoIds] = useState([]); 
  const [timeWatched, setTimeWatched] = useState(0);
  const [hasWatched, setHasWatched] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [errorText, setErrorText] = useState('');



  const timerRef = useRef(null);

  // Fetch dữ liệu video và bài kiểm tra khi có `_id`
  useEffect(() => {
    if (_id) {
      fetch(`${BASE_URL}/lessonVideo/getLessonVideoByLessonID/${_id}`)
        .then((response) => response.json())
        .then((json) => setVideoData(json))
        .catch((error) => console.error('Lỗi khi lấy dữ liệu video:', error));

      fetch(`${BASE_URL}/test/getTestByLessonID/${_id}`)
        .then((response) => response.json())
        .then((json) => setTestData(json))
        .catch((error) => console.error('Lỗi khi lấy dữ liệu bài kiểm tra:', error));
    }
  }, [_id]);

  // Bắt đầu phát video và thiết lập bộ đếm thời gian
  const handlePlayVideo = (videoUrl) => {
    const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
    setVideoLink(videoId);
    setIsPlaying(true);
    setTimeWatched(0);
    setHasWatched(false);
    timerRef.current = setInterval(() => {
      setTimeWatched((prevTime) => prevTime + 1);
    }, 1000);
  };

  // Dừng video và tắt bộ đếm thời gian
  const handleStopVideo = () => {
    setIsPlaying(false);
    clearInterval(timerRef.current);
  };

  // Điều hướng đến màn hình bài Quiz nếu đã xem đủ thời gian
  const handleGoToQuiz = (testId, index) => {
    setErrorText(''); 
  
    if (!hasWatched) {
      
      setModalVisible(true);
      return;
    }
  
    // Gọi API để kiểm tra trạng thái bài kiểm tra
    fetch(`${BASE_URL}/score/scores/canTakeTest/${userID}/${testId}`)
      .then((response) => response.json())
      .then((json) => {
        console.log('API response:', json); // Log phản hồi từ API
  
        // Kiểm tra nếu có success
        if (json.success) {
          navigation.navigate('QuizzCourse', { testId, userID });
        } else if (json.message) { // Kiểm tra json.message thay vì json.error
          // Kiểm tra các thông báo lỗi từ API
          if (json.message === 'Người dùng chưa làm bài kiểm tra này.') {
            // Nếu thông báo là người dùng chưa làm bài kiểm tra, cho phép làm bài
            navigation.navigate('QuizzCourse', { testId, userID });
          } else if (json.message === 'Không thể kiểm tra trạng thái bài test.') {
            // Nếu không thể kiểm tra trạng thái, cho phép làm bài kiểm tra
            navigation.navigate('QuizzCourse', { testId, userID });
          } else {
            // Xử lý các thông báo lỗi khác
            setErrorText('Có lỗi xảy ra, vui lòng thử lại sau.');
          }
        } else {
          // Xử lý khi không nhận được success hoặc message từ API
          setErrorText('Có lỗi xảy ra, vui lòng thử lại sau.');
        }
      })
      .catch((error) => {
        console.error('Lỗi hệ thống:', error);
        setErrorText('Lỗi hệ thống, vui lòng thử lại sau.');
      });
  };
  

  // Hiển thị các item bài kiểm tra
  const renderTestItem = ({ item, index }) => {
    console.log(`Test ID ${index + 1}: ${item._id}`); // Log ra testId của bài kiểm tra
    const updatedAt = item.updatedAt.split('T')[0];
  
    return (
      <View style={styles.columnItem}>
        <View style={styles.courseSection}>
          <View style={styles.number_container}>
            <Text style={styles.number}>{String(index + 1).padStart(2, '0')}</Text>
          </View>
          <View style={styles.column_text}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            <Text style={styles.sectionDay}>{updatedAt}</Text>
          </View>
          <TouchableOpacity onPress={() => handleGoToQuiz(item._id, index)}>
            <Image
              source={require('../design/image/ic_quiz.png')}
              style={[
                styles.icon_quizz,
                { opacity: hasWatched ? 1 : 0.5 },
              ]}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.separator} />
      </View>
    );
  };
  



  // Hiển thị các item video
  const renderVideoItem = ({ item, index }) => {
    console.log(`VIDEO ID ${index + 1}: ${item._id}`);
    const updatedAt = item.updatedAt.split('T')[0];

    return (
      <View style={styles.columnItem}>
        <View style={styles.courseSection}>
          <View style={styles.number_container}>
            <Text style={styles.number}>{String(index + 1).padStart(2, '0')}</Text>
          </View>
          <View style={styles.column_text}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            <Text style={styles.sectionDay}>{updatedAt}</Text>
          </View>
          <TouchableOpacity onPress={() => handlePlayVideo(item.video)}>
            <Image source={require('../design/image/icon_play.png')} style={styles.icon_quizz} />
          </TouchableOpacity>
        </View>
        <View style={styles.separator} />
      </View>
    );
  };


  // Cập nhật trạng thái đã xem sau khi người dùng đã xem đủ 10 giây
  useEffect(() => {
    if (timeWatched >= 10 && !hasWatched) {
      setHasWatched(true);
      clearInterval(timerRef.current);
    }
  }, [timeWatched, hasWatched]);

  // Hủy bỏ bộ đếm thời gian khi thoát khỏi màn hình
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack}>
          <Image source={require('../design/image/ic_back.png')} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Video & Bài Quizz</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput style={styles.input} placeholder="Tìm kiếm..." />
        <TouchableOpacity>
          <Image source={require('../design/image/ic_search.png')} style={styles.searchIcon} />
        </TouchableOpacity>
      </View>

      {isPlaying && videoLink ? (
        <View style={{ flex: 1 }}>
          <YouTubeIframe
            height={videoHeight}
            videoId={videoLink}
            play={true}
            onChangeState={(event) => {
              if (event === 'paused' || event === 'ended') {
                handleStopVideo();
              }
            }}
          />
          <Text
            style={[
              styles.timerText,
              timeWatched < 10 ? styles.timerRedText : styles.timerGreenText
            ]}
          >
            {timeWatched < 10
              ? `Xem thêm ${10 - timeWatched} giây để mở khóa bài kiểm tra.`
              : 'Bạn đã xem đủ 10 giây !'}
          </Text>
          {timeWatched >= 10 && (
            <TouchableOpacity
              style={styles.quizButton}
              onPress={() => {
                handleStopVideo();
              }}
            >
              <Text style={styles.quizButtonText}>Làm bài quizz ngay !</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <>
          {videoData.length === 0 && testData.length === 0 ? (
            <Text style={styles.noLessons}>Bài học chưa được cập nhật từ giáo viên.</Text>
          ) : (
            <>
              <Text style={styles.sectionHeader}>Phần Video Bài Học</Text>
              {videoData.length === 0 ? (
                <Text style={styles.noLessons}>Chưa có video bài giảng! Đợi cập nhật từ giảng viên.</Text>
              ) : (
                <View style={[styles.container_list]}>
                  <FlatList
                    data={videoData}
                    renderItem={renderVideoItem}
                    keyExtractor={(item, index) => `${item._id}-video-${index}`}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                  />
                </View>
              )}
              <Text style={styles.sectionHeader}>Phần Bài Kiểm Tra</Text>
              {testData.length === 0 ? (
                <Text style={styles.noLessons}>Chưa có bài kiểm tra nào! Đợi cập nhật từ giảng viên.</Text>
              ) : (
                <View style={[styles.container_list]}>
                  <FlatList
                    data={testData}
                    renderItem={renderTestItem}
                    keyExtractor={(item, index) => `${item._id}-test-${index}`}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                  />
                </View>
              )}
            </>
          )}
        </>
      )}
      <Text style={[styles.txtError, { display: errorText ? 'flex' : 'none' }]}>{errorText}</Text>


      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Image
              source={require('../design/image/failPayment.png')}
              style={styles.modalImage}
            />
            <Text style={styles.modalTitle}>Chưa đủ điều kiện làm bài !</Text>
            <Text style={styles.modalMessage}>
              Bạn phải xem video bài học đủ thời gian !
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Đã hiểu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>

  );
};

export default DetailLesson;