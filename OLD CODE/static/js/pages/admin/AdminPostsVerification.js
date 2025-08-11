import React, {useCallback, useEffect, useState} from 'react';
import Nav from 'react-bootstrap/Nav';
// import {messageService} from '../../services/messageService';
import PostPreview from '../../coms/post/PostPreview';

import 'react-quill/dist/quill.snow.css';

import '../../css/messages.css';
import {api} from '../../services/api';
import '../../css/textEditor.css';

export const PostModerationStatus = {
  verified: 'verified',
  notVerified: 'notVerified',
  adminToVerify: 'adminToVerify',
  blocked: 'blocked'
};

const TabKey = {
  first: '1',
  second: '2',
  third: '3',
  fourth: '4'
};

const AdminPostsVerification = () => {
  const [tab, setTab] = useState(TabKey.first);
  const [posts, setPostTab] = useState({
    notVerified: [],
    verified: [],
    blocked: [],
    adminToVerify: []
  });

  const getPosts = useCallback(async () => {
    const resp = await api.getPostsToModerate();

    const posts = {
      notVerified: [],
      verified: [],
      blocked: [],
      adminToVerify: []
    }

    resp.allPosts.forEach(post => {
      if (post.postModerationStatus === PostModerationStatus.notVerified) {
        posts.notVerified.push(post);
      }
      if (post.postModerationStatus === PostModerationStatus.blocked) {
        posts.blocked.push(post);
      }
      if (post.postModerationStatus === PostModerationStatus.adminToVerify) {
        posts.adminToVerify.push(post);
      }
      if (post.postModerationStatus === PostModerationStatus.verified) {
        posts.verified.push(post);
      }
      if (typeof post.postModerationStatus === "undefined") {
        posts.notVerified.push(post);
      }
    })

    setPostTab(posts);
  }, []);

  const onStatusChange = useCallback(async (id, i, prevStatus, nextStatus) => {
    const newPosts = { ...posts };

    newPosts[nextStatus].push(newPosts[prevStatus][i]);
    newPosts[prevStatus].splice(i, 1);

    await api.setPostModerationStatus({ id, nextStatus });

    setPostTab(newPosts);
  }, [posts]);

  useEffect(() => {
    getPosts();
  }, [getPosts]);

  return (
    <div className="messages">
      <Nav justify variant="tabs" defaultActiveKey={TabKey.first} onSelect={(tab) => setTab(tab)}>
        <Nav.Item>
          <Nav.Link eventKey={TabKey.first}>Всі до розгляду</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey={TabKey.second}>Всі заблоковані</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey={TabKey.third}>Всі для адміна</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey={TabKey.fourth}>20 верифікованих</Nav.Link>
        </Nav.Item>
      </Nav>
      <div className="form-group row mb-lg-4" />

      {tab === TabKey.first && (
        posts.notVerified.map((post, i) =>
          <div className="d-flex" key={post._id}>
            <PostPreview post={post} user={post.user} postAvailable={true} showInteractContainer={false}/>
            <div className="d-flex flex-column align-items-start ml-5">
              <button className="btn btn-primary btn-success mb-4"
                onClick={() => onStatusChange(post._id, i, PostModerationStatus.notVerified, PostModerationStatus.verified)}>
                норм контент
              </button>
              <button className="btn btn-primary btn-danger mb-4"
                onClick={() => onStatusChange(post._id, i, PostModerationStatus.notVerified, PostModerationStatus.blocked)}>
                блок 100%
              </button>
              <button className="btn btn-primary btn-info"
                onClick={() => onStatusChange(post._id, i, PostModerationStatus.notVerified, PostModerationStatus.adminToVerify)}>
                до адміна
              </button>
            </div>
          </div>
        )
      )}

      {tab === TabKey.second && (
        posts.blocked.map((post, i) =>
          <div className="d-flex" key={post._id}>
            <PostPreview post={post} user={post.user} postAvailable={true} showInteractContainer={false}/>
            <div className="d-flex flex-column align-items-start ml-5">
              <button className="btn btn-primary btn-success mb-4"
                onClick={() => onStatusChange(post._id, i, PostModerationStatus.blocked, PostModerationStatus.verified)}>
                норм контент
              </button>
              <button className="btn btn-primary btn-info"
                onClick={() => onStatusChange(post._id, i, PostModerationStatus.blocked, PostModerationStatus.adminToVerify)}>
                до адміна
              </button>
            </div>
          </div>
        )
      )}

      {tab === TabKey.third && (
        posts.adminToVerify.map((post, i) =>
          <div className="d-flex" key={post._id}>
            <PostPreview post={post} user={post.user} postAvailable={true} showInteractContainer={false}/>
            <div className="d-flex flex-column align-items-start ml-5">
              <button className="btn btn-primary btn-success mb-4"
                onClick={() => onStatusChange(post._id, i, PostModerationStatus.adminToVerify, PostModerationStatus.verified)}>
                норм контент
              </button>
              <button className="btn btn-primary btn-danger"
                onClick={() => onStatusChange(post._id, i, PostModerationStatus.adminToVerify, PostModerationStatus.blocked)}>
                блок 100%
              </button>
            </div>
          </div>
        )
      )}

      {tab === TabKey.fourth && (
        posts.verified.map((post, i) =>
          <div className="d-flex" key={post._id}>
            <PostPreview post={post} user={{}} postAvailable={true} showInteractContainer={false}/>
            <div className="d-flex flex-column align-items-start ml-5">
              <button className="btn btn-primary btn-info"
                onClick={() => onStatusChange(post._id, i, PostModerationStatus.verified, PostModerationStatus.adminToVerify)}>
                до адміна
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default AdminPostsVerification;
